#!/usr/bin/env bats

TEST_DIR="$(realpath "$(dirname "$BATS_TEST_FILENAME")")"
source "$TEST_DIR/../../cli/tests/mocks"

setup() {
    bats_load_library bats-support
    bats_load_library bats-assert
    setup_mocks

    sleep() { log_mock_call sleep $@; return 1; }
    test() { log_mock_call test "$@"; return 1; }

    mock apt
    apt-get() {
        log_mock_call apt-get "$@"
        if [[ " $* " == *" upgrade "* ]]; then
            set_mock_state "upgrade_frontend" "$DEBIAN_FRONTEND"
        fi
    }

    mock install
    dpkg() {
        log_mock_call dpkg "$@"
        if [[ " $* " == *"--print-architecture"* ]]; then echo "arch"; fi
    }

    mock sed
    tee() {
        local input=""
        if [ ! -t 0 ]; then
            while IFS= read -r line; do input+="$line"$'\n'; done
        fi
        log_mock_call tee "$@" "$input"
    }

    mock mkdir
    mock cp
    mock chmod
    mock chown
    mock rm
    mock ls
    mock su
    mock useradd
    mock usermod
    mock systemctl
    mock curl
    mock ufw

    VERSION_CODENAME="codename"
    environment="production"
    app_package="app-package"
    hostname="example.com"
    ssh_port="2222"
    ssh_public_key="ssh-rsa abcd123 comment"
    acme_email=""
    container_name="container"

    cloud_init() { source "infra/cloud-init.tftpl"; }
}

teardown() {
    teardown_mocks
}

@test "initializes" {
    run cloud_init
    assert_success
    assert_output --partial "Starting deployment cloud-init script..."
    assert_output --partial "Cloud-init script completed successfully."
}

@test "upgrades system packages interactively" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        apt-get update -- \
        apt-get -o Dpkg::Options::="--force-confold" -y upgrade
    assert_mock_state "upgrade_frontend" "noninteractive"
}

@test "installs ufw" {
    run cloud_init
    assert_success
    assert_mock_called_once apt-get install ufw -y
}

@test "installs Docker and dependencies" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        apt-get install ca-certificates curl -- \
        curl -fsSL https://download.docker.com/linux/debian/gpg \
            -o /etc/apt/keyrings/docker.asc -- \
        chmod a+r /etc/apt/keyrings/docker.asc -- \
        tee /etc/apt/sources.list.d/docker.list \
            "deb [arch=arch signed-by=/etc/apt/keyrings/docker.asc]
                https://download.docker.com/linux/debian codename stable" -- \
        apt-get update -- \
        apt-get install docker-ce docker-ce-cli containerd.io \
            docker-buildx-plugin docker-compose-plugin -y
}

@test "cleans up packages" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        apt autoremove -y -- \
        apt clean -y
}

@test "configures SSH port" {
    run cloud_init
    assert_success
    assert_mock_called_once sed -i \
        's/^#Port 22/Port '"${ssh_port}"'/' /etc/ssh/sshd_config
}

@test "disables root login in SSH" {
    run cloud_init
    assert_success
    assert_mock_called_once sed -i \
        's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
}

@test "removes SSH config files" {
    run cloud_init
    assert_success
    assert_mock_called_once rm -r /etc/ssh/ssh_config.d/*.conf
}

@test "ignores empty SSH config directory" {
    ls() { log_mock_call ls "$@"; return 1; }
    run cloud_init
    assert_success
    assert_mock_not_called rm -r /etc/ssh/ssh_config.d/*.conf
}

@test "restarts SSH service" {
    run cloud_init
    assert_success
    assert_mock_called_once systemctl restart sshd
}

@test "configures UFW" {
    run cloud_init
    assert_success
    assert_mock_called_once ufw default deny incoming
    assert_mock_called_once ufw default allow outgoing
    assert_mock_called_once ufw allow "${ssh_port}"/tcp
    assert_mock_called_once ufw allow 80/tcp
    assert_mock_called_once ufw allow 443/tcp
    assert_mock_called_once ufw --force enable
}

@test "initializes Docker" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        systemctl start docker -- \
        systemctl enable docker
}

@test "creates app user" {
    run cloud_init
    assert_success
    assert_mock_called_once useradd -m -s /bin/bash app
    assert_mock_called_once usermod -aG docker app
}

@test "configures app user SSH" {
    run cloud_init
    assert_success
    assert_mock_called_once mkdir -p /home/app/.ssh
    assert_mock_called_once tee /home/app/.ssh/authorized_keys \
        "${ssh_public_key}"
    assert_mock_called_once chown -R app:app /home/app/.ssh
    assert_mock_called_once chmod 700 /home/app/.ssh
    assert_mock_called_once chmod 600 /home/app/.ssh/authorized_keys
}

@test "checks static files provisioned before copying" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        test ! -d /root/static -- \
        cp -r /root/static /home/app/static
}

@test "changes ownership of static files" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        cp -r /root/static /home/app/static -- \
        chown -R app:app /home/app/static
}

@test "does not start caddy if static files not provisioned" {
    test() {
        log_mock_call test "$@"
        if [[ " $* " == *" /root/static "* ]]; then return 0; fi
    }
    run cloud_init
    assert_failure
    assert_mock_not_called su - app
}

@test "checks Caddyfile provisioned before copying" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        test ! -f /root/Caddyfile -- \
        cp /root/Caddyfile /home/app/Caddyfile
}

@test "changes ownership of Caddyfile" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        cp /root/Caddyfile /home/app/Caddyfile -- \
        chown app:app /home/app/Caddyfile
}

@test "does not start caddy if Caddyfile not provisioned" {
    test() {
        log_mock_call test "$@"
        if [[ " $* " == *" /root/Caddyfile "* ]]; then return 0; fi
    }
    run cloud_init
    assert_failure
    assert_mock_not_called su - app
}

@test "checks Alloy config provisioned before copying" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        test ! -f /root/config.alloy -- \
        cp /root/config.alloy /home/app/config.alloy
}

@test "changes ownership of Alloy config" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        cp /root/config.alloy /home/app/config.alloy -- \
        chown app:app /home/app/config.alloy
}

@test "does not start Alloy if config not provisioned" {
    test() {
        log_mock_call test "$@"
        if [[ " $* " == *" /root/config.alloy "* ]]; then return 0; fi
    }
    run cloud_init
    assert_failure
    assert_mock_not_called su - app
}

@test "checks app environment file provisioned before copying" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        test ! -f /root/.env -- \
        cp /root/.env /home/app/.env
}

@test "changes ownership of app environment file" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        cp /root/.env /home/app/.env -- \
        chown app:app /home/app/.env
}

@test "does not start application if static files not provisioned" {
    test() {
        log_mock_call test "$@"
        if [[ " $* " == *" /root/.env "* ]]; then return 0; fi
    }
    run cloud_init
    assert_failure
    assert_mock_not_called su - app
}

@test "starts Caddy container" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        su - app -c "docker network create web" -- \
        su - app -c "docker run -d \
            --name caddy \
            --network web \
            --restart unless-stopped \
            -p 80:80 \
            -p 443:443 \
            -v /home/app/Caddyfile:/etc/caddy/Caddyfile \
            -v /home/app/static:/srv/static \
            caddy:latest"
}

@test "starts application container" {
    run cloud_init
    assert_success
    assert_mocks_called_in_order \
        su - app -c "docker network create web" -- \
        su - app -c "docker run -d \
            --name container \
            --network web \
            --restart unless-stopped \
            --env-file /home/app/.env \
            app-package"
}

@test "starts Alloy container" {
    run cloud_init
    assert_success
    assert_mock_called_once \
        su - app -c "docker run -d \
            --name alloy \
            --restart unless-stopped \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v /home/app/config.alloy:/etc/alloy/config.alloy \
            grafana/alloy:latest \
            run --server.http.listen-addr=0.0.0.0:12345 etc/alloy/config.alloy"
}
