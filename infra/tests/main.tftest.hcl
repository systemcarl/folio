variables {
    environment = "test"
    namespace = "app-account"
    app_package = "app-package"
    app_version = "1.2.3"
    domain = "app.example.com"
    dns_zone = "abc123"
    ssh_port = 2222
    ssh_key_id = 1234
    ssh_private_key_file = "tests/key"
    ssh_public_key_file = "tests/key.pub"
    cf_token = "abcde12345abcde12345abcde12345abcde12345"
    do_token = "12345abcde12345abcde12345abcde12345abcde"
    loki_url = "https://loki.example.com/loki/api/v1/push"
    loki_username = "123456"
    loki_password = "abcdef"
}

run "renders_env_file_base_url" {
    command = plan
    assert {
        condition = strcontains(local.env_file, "BASE_URL=http://caddy")
        error_message = "Environment file does not define BASE_URL."
    }
}

run "renders_env_file_public_environment" {
    command = plan
    assert {
        condition = strcontains(
            local.env_file,
            "PUBLIC_ENVIRONMENT=${var.environment}",
        )
        error_message = "Environment file does not define PUBLIC_ENVIRONMENT."
    }
}

run "renders_env_file_public_base_url" {
    command = plan
    assert {
        condition = strcontains(
            local.env_file,
            "PUBLIC_BASE_URL=https://${var.domain}",
        )
        error_message = "Environment file does not define PUBLIC_BASE_URL."
    }
}

run "renders_env_file_public_favicon" {
    command = plan
    assert {
        condition = strcontains(
            local.env_file,
            "PUBLIC_FAVICON=/favicon.svg",
        )
        error_message = "Environment file does not define PUBLIC_FAVICON."
    }
}

run "renders_env_file_public_sentry_dsn" {
    command = plan
    assert {
        condition = strcontains(
            local.env_file,
            "PUBLIC_SENTRY_DSN=${var.sentry_dsn}",
        )
        error_message = "Environment file does not define PUBLIC_SENTRY_DSN."
    }
}

run "renders_caddyfile_globals" {
    command = plan

    variables {
        acme_email = "ssl@example.com"
    }
    assert {
        condition = can(regex(join("", [
            "^\\{",
            "[^}]*email ssl@example\\.com",
            "[^}]*acme_ca ",
                "https://acme-staging-v02\\.api\\.letsencrypt\\.org/directory",
            "[^}]*\\}"
        ]), local.caddyfile))
        error_message = "Caddyfile does not define globals."
    }
}

run "does_not_render_empty_globals" {
    command = plan

    variables {
        environment = "production"
    }

    assert {
        condition = !can(regex("^\\{", local.caddyfile))
        error_message = "Caddyfile defines empty globals."
    }
}

run "does_not_render_caddyfile_acme_email_if_empty" {
    command = plan
    assert {
        condition = !strcontains(local.caddyfile, "email ${var.acme_email}")
        error_message = "Caddyfile does not define ACME email."
    }
}

run "does_not_render_production_caddyfile_acme_certificate_authority" {
    command = plan

    variables {
        environment = "production"
    }

    assert {
        condition = !strcontains(
            local.caddyfile,
            "acme_ca https://acme-staging-v02.api.letsencrypt.org/directory",
        )
        error_message = "Caddyfile specifies staging ACME server in production."
    }
}

run "renders_caddyfile_external_virtual_host" {
    command = plan
    assert {
        condition = can(regex(join("", [
            "app\\.example\\.com \\{",
            "[^}]*root \\* /srv/static",
            "[^}]*header \\{",
            "[^}]*Cache-Control ",
                "\"public, max-age=60, stale-while-revalidate=30\"",
            "[^}]*X-Robots-Tag \"noindex, nofollow\"",
            "[^}]*\\}",
            "[^}]*@has_file file {path}",
            "[^}]*handle @has_file \\{[^}]*file_server[^}]*\\}",
            "[^}]*reverse_proxy app-package:3000",
            "[^}]*\\}"
        ]), local.caddyfile))
        error_message = "Caddyfile does not define external service."
    }
}

run "does_not_render_production_robots_header" {
    command = plan

    variables {
        environment = "production"
    }

    assert {
        condition = !can(regex(join("", [
            "app.example.com \\{",
            "[^}]*header \\{",
            "[^}]*X-Robots-Tag \"noindex, nofollow\"",
            "[^}]*\\}",
            "[^}]*\\}",
        ]), local.caddyfile))
        error_message = "Caddyfile defines robots header in production."
    }
}

run "renders_caddyfile_internal_static_service" {
    command = plan
    assert {
        condition = can(regex(join("", [
            "http://caddy \\{",
            "[^}]*root \\* /srv/static",
            "[^}]*file_server",
            "[^}]*\\}",
        ]), local.caddyfile))
        error_message = "Caddyfile does not define internal service."
    }
}

run "renders_alloy_config_discovery" {
    command = plan
    assert {
        condition = can(regex(join("", [
            "discovery\\.docker \"containers\" \\{",
            "[^}]*host = \"unix:///var/run/docker\\.sock\"",
            "[^}]*\\}",
        ]), local.alloy_file))
        error_message = "Alloy config does not define docker discovery."
    }
}

run "renders_alloy_config_container_relabelling" {
    command = plan
    assert {
        condition = can(regex(join("", [
            "discovery\\.relabel \"logs_integrations_docker\" \\{",
            "[^}]*targets = discovery\\.docker\\.containers\\.targets",
            "[^}]*rule \\{",
            "[^}]*source_labels = \\[\"__meta_docker_container_name\"\\]",
            "[^}]*regex = \"/\" \\+ \"app-package\"",
            "[^}]*action = \"keep\"",
            "[^}]*\\}",
            "[^}]*rule \\{",
            "[^}]*source_labels = \\[\"__meta_docker_container_name\"\\]",
            "[^}]*regex = \"/\\(\\.\\*\\)\"",
            "[^}]*target_label = \"service_name\"",
            "[^}]*\\}",
            "[^}]*\\}",
        ]), local.alloy_file))
        error_message = "Alloy config does not define docker relabelling."
    }
}

run "renders_alloy_config_loki_source" {
    command = plan
    assert {
        condition = can(regex(join("", [
            "loki\\.source\\.docker \"default\" \\{",
            "[^}]*host = \"unix:///var/run/docker\\.sock\"",
            "[^}]*targets = ",
                "discovery\\.relabel\\.logs_integrations_docker\\.output",
            "[^}]*labels = \\{",
            "[^}]*\"level\" = 30,",
            "[^}]*\"environment\" = \"test\"",
            "[^}]*\\}",
            "[^}]*forward_to = \\[loki\\.process\\.default\\.receiver\\]",
            "[^}]*\\}",
        ]), local.alloy_file))
        error_message = "Alloy config does not define loki source."
    }
}

run "renders_alloy_config_loki_process" {
    command = plan
    assert {
        condition = can(regex(join("", [
            "loki\\.process \"default\" \\{",
            "[^}]*stage\\.json \\{",
            "[^}]*expressions = \\{",
            "[^}]*level = \"\"",
            "[^}]*type = \"\"",
            "[^}]*\\}",
            "[^}]*\\}",
            "[^}]*stage\\.labels \\{",
            "[^}]*values = \\{",
            "[^}]*level = \"\"",
            "[^}]*type = \"\"",
            "[^}]*\\}",
            "[^}]*\\}",
            "[^}]*forward_to = ",
                "\\[loki\\.relabel\\.map_level_to_text\\.receiver\\]",
            "[^}]*\\}",
        ]), local.alloy_file))
        error_message = "Alloy config does not define loki process."
    }
}

run "renders_alloy_config_loki_relabel" {
    command = plan
    assert {
        condition = can(regex(join("", [
            "loki\\.relabel \"map_level_to_text\" \\{",
            "[^}]*rule \\{",
            "[^}]*source_labels = \\[\"level\"\\]",
            "[^}]*target_label = \"level\"",
            "[^}]*regex = \"\\^\\(1\\\\\\\\d\\)\\$\"",
            "[^}]*replacement = \"trace\"",
            "[^}]*\\}",
            "[^}]*rule \\{",
            "[^}]*source_labels = \\[\"level\"\\]",
            "[^}]*target_label = \"level\"",
            "[^}]*regex = \"\\^\\(2\\\\\\\\d\\)\\$\"",
            "[^}]*replacement = \"debug\"",
            "[^}]*\\}",
            "[^}]*rule \\{",
            "[^}]*source_labels = \\[\"level\"\\]",
            "[^}]*target_label = \"level\"",
            "[^}]*regex = \"\\^\\(3\\\\\\\\d\\)\\$\"",
            "[^}]*replacement = \"info\"",
            "[^}]*\\}",
            "[^}]*rule \\{",
            "[^}]*source_labels = \\[\"level\"\\]",
            "[^}]*target_label = \"level\"",
            "[^}]*regex = \"\\^\\(4\\\\\\\\d\\)\\$\"",
            "[^}]*replacement = \"warn\"",
            "[^}]*\\}",
            "[^}]*rule \\{",
            "[^}]*source_labels = \\[\"level\"\\]",
            "[^}]*target_label = \"level\"",
            "[^}]*regex = \"\\^\\(5\\\\\\\\d\\)\\$\"",
            "[^}]*replacement = \"error\"",
            "[^}]*\\}",
            "[^}]*rule \\{",
            "[^}]*source_labels = \\[\"level\"\\]",
            "[^}]*target_label = \"level\"",
            "[^}]*regex = \"\\^\\(6\\\\\\\\d\\)\\$\"",
            "[^}]*replacement = \"fatal\"",
            "[^}]*\\}",
            "[^}]*forward_to = \\[loki\\.write\\.cloud\\.receiver\\]",
            "[^}]*\\}",
        ]), local.alloy_file))
        error_message = "Alloy config does not define loki relabel."
    }
}

run "renders_alloy_config_loki_write" {
    command = plan
    assert {
        condition = can(regex(join("", [
            "loki\\.write \"cloud\" \\{",
            "[^}]*url = \"https://loki\\.example\\.com/loki/api/v1/push\"",
            "[^}]*basic_auth \\{",
            "[^}]*username = \"123456\"",
            "[^}]*password = \"abcdef\"",
            "[^}]*\\}",
            "[^}]*\\}",
        ]), local.alloy_file))
        error_message = "Alloy config does not define loki write."
    }
}

run "env_checksum_matches_env_file" {
    command = plan
    assert {
        condition = (local.env_check == sha256(local.env_file))
        error_message = "Environment checksum does not match file."
    }
}

run "assets_checksum_matches_folder_contents" {
    command = plan
    assert {
        condition = (local.assets_check ==
            sha256(join(" ", sort(fileset("${path.module}/../assets/", "**")))))
        error_message = "Asset checksum does not match contents."
    }
}

run "caddyfile_checksum_matches_folder_contents" {
    command = plan
    assert {
        condition = (local.caddyfile_check == sha256(local.caddyfile))
        error_message = "Caddyfile checksum does not match contents."
    }
}

run "alloy_config_checksum_matches_file" {
    command = plan
    assert {
        condition = (local.alloy_check == sha256(local.alloy_file))
        error_message = "Alloy config checksum does not match file."
    }
}

run "creates_droplet_with_name_app" {
    command = plan
    assert {
        condition = digitalocean_droplet.app.name == "app"
        error_message = "Droplet name not as expected."
    }
}

run "creates_droplet_using_correct_image" {
    command = plan
    assert {
        condition = digitalocean_droplet.app.image == "debian-12-x64"
        error_message = "Droplet image not as expected."
    }
}

run "creates_droplet_in_correct_region" {
    command = plan
    assert {
        condition = digitalocean_droplet.app.region == "tor1"
        error_message = "Droplet region not as expected."
    }
}

run "creates_droplet_with_correct_size" {
    command = plan
    assert {
        condition = digitalocean_droplet.app.size == "s-1vcpu-1gb"
        error_message = "Droplet size not as expected."
    }
}

run "creates_droplet_with_correct_ssk_key_id" {
    command = plan
    assert {
        condition = contains(digitalocean_droplet.app.ssh_keys, "1234")
        error_message = "Droplet SSH key ID not as expected."
    }
}

run "creates_droplet_with_correct_user_data" {
    command = plan

    assert {
        condition = digitalocean_droplet.app.user_data == sha1(
            templatefile(
                "${path.module}/cloud-init.tftpl",
                {
                    environment = "test",
                    ssh_port = 2222,
                    ssh_public_key = file("tests/key.pub"),
                    hostname = "app.example.com",
                    container_name = "app-package",
                    app_package = "ghcr.io/app-account/app-package:1.2.3",
                    acme_email = ""
                }
            )
        )
        error_message = "Droplet user data not as expected."
    }
}

run "creates_droplet_with_correct_tags" {
    command = plan
    assert {
        condition = contains(digitalocean_droplet.app.tags, "app-package")
        error_message = "Droplet tags do not include application package name."
    }
    assert {
        condition = contains(digitalocean_droplet.app.tags, "test")
        error_message = "Droplet tags do not include environment."
    }
}

run "creates_reserved_ip_in_correct_region" {
    command = plan
    assert {
        condition = digitalocean_reserved_ip.app_ip.region == "tor1"
        error_message = "Reserved IP region not as expected."
    }
}
