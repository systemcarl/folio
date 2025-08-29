terraform {
    required_version = "~> 1.12.2"
    backend "gcs" {
        bucket = "folio-terraform"
    }
    required_providers {
        cloudflare = {
            source  = "cloudflare/cloudflare"
            version = "~> 5"
        }
        digitalocean = {
            source = "digitalocean/digitalocean"
            version = "~> 2.55"
        }
    }
}

provider "cloudflare" {
    api_token = var.cf_token
}

provider "digitalocean" {
    token = var.do_token
}

locals {
    app_version = (
        var.app_version != ""
            ? var.app_version
            : jsondecode(file("${path.module}/../app/package.json")).version
    )

    env_file = templatefile("${path.module}/.env.tftpl", {
        environment = var.environment,
        domain = var.domain,
        sentry_dsn = var.sentry_dsn
    })
    env_check = sha256(local.env_file)

    caddyfile = templatefile("${path.module}/Caddyfile.tftpl", {
        environment = var.environment,
        hostname = var.domain,
        acme_email = var.acme_email,
    })
    caddyfile_check = sha256(local.caddyfile)

    assets_check = sha256(join(" ",
         sort(fileset("${path.module}/../assets/", "**"))
    ))
}

resource "digitalocean_droplet" "app" {
    name = "app"
    image = "debian-12-x64"
    region = "tor1"
    size = "s-1vcpu-1gb"
    ssh_keys = [var.ssh_key_id]
    user_data = templatefile(
        "${path.module}/cloud-init.tftpl",
        {
            environment = var.environment,
            ssh_port = var.ssh_port,
            ssh_public_key = file(var.ssh_public_key_file),
            hostname = var.domain,
            app_package = join("", [
                "ghcr.io/${var.namespace}/",
                "${var.app_package}:${local.app_version}"
            ]),
            acme_email = var.acme_email,
        }
    )
    tags = ["${var.app_package}", "${var.environment}"]
}

resource "null_resource" "upload" {
    count = var.is_test ? 0 : 1

    triggers = {
        droplet_id = digitalocean_droplet.app.id
    }

    connection {
        host = digitalocean_droplet.app.ipv4_address
        user = "root"
        private_key = file(var.ssh_private_key_file)
    }

    provisioner "file" {
        content = local.env_file
        destination = "/root/.env"
    }

    provisioner "file" {
        content = local.caddyfile
        destination = "/root/Caddyfile"
    }

    provisioner "file" {
        source = "${path.module}/../assets"
        destination = "/root/static/"
    }

    provisioner "file" {
        content = templatefile("${path.module}/checksum.tftpl", {
            env_check = local.env_check,
            caddyfile_check = local.caddyfile_check,
            assets_check = local.assets_check
        })
        destination = "/root/checksum"
    }

    provisioner "remote-exec" {
        inline = [
            "if [ ! -f /root/checksum ]; then",
                "echo 'checksum not found'; exit 1;",
            "fi",
            "chmod +x /root/checksum",
            "bash /root/checksum || exit 1",
        ]
    }
}

resource "digitalocean_reserved_ip" "app_ip" {
    region = "tor1"
}

resource "digitalocean_reserved_ip_assignment" "assign_ip" {
    droplet_id = digitalocean_droplet.app.id
    ip_address = digitalocean_reserved_ip.app_ip.ip_address
}

resource "cloudflare_dns_record" "a" {
    zone_id = var.dns_zone
    name = var.domain
    type = "A"
    comment = "Personal website and portfolio."
    content = digitalocean_reserved_ip.app_ip.ip_address
    proxied = true
    ttl = 1
}
