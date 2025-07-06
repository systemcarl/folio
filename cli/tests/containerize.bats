#!/usr/bin/env bats

TEST_DIR="$(realpath "$(dirname "$BATS_TEST_FILENAME")")"
source "$TEST_DIR/mocks"
source "$TEST_DIR/../containerize"

setup() {
    bats_load_library bats-support
    bats_load_library bats-assert
    setup_mocks

    mock npm

    docker() {
        log_mock_call docker "$@"
        if [[ "$1" == "image" && "$2" == "inspect" ]]; then
            if [[ $(get_mock_state image_local) == "false" ]]; then
                return 1
            fi
        elif [[ "$1" == "pull" ]]; then
            if [[ $(get_mock_state "image_published") == "false" ]]; then
                return 1
            fi
        fi
    }

    get_version() {
        log_mock_call get_version "$@"
        echo "1.2.3"
    }

    set_mock_state "image_local" "false"
    set_mock_state "image_published" "false"

    mock load_env

    FOLIO_CICD_ACCOUNT="cicd-account"
    FOLIO_CICD_REPO="cicd-repo"
}

teardown() {
    teardown_mocks
}

@test "containerizes application" {
    run containerize
    assert_success
}

@test "loads environment" {
    run containerize
    assert_success
    assert_mock_called_once load_env
}

@test "get application version" {
    run containerize
    assert_success
    assert_mock_called_once get_version app
}

@test "fetches local image" {
    run containerize
    assert_success
    assert_mock_called_once docker image inspect \
        "cicd-repo:1.2.3"
}

@test "doesn't rebuild if local image exists" {
    set_mock_state "image_local" "true"
    run containerize
    assert_success
    assert_output --partial \
        "Docker image 'cicd-repo:1.2.3' already exists."
    assert_mock_not_called npm install
    assert_mock_not_called docker build
}

@test "fetches published image" {
    set_mock_state "image_published" "true"
    run containerize
    assert_success
    assert_mock_called_once docker pull \
        "ghcr.io/cicd-account/cicd-repo:1.2.3"
}

@test "doesn't rebuild local image published" {
    set_mock_state "image_published" "true"
    run containerize
    assert_success
    assert_output --partial \
        "Docker image 'ghcr.io/cicd-account/cicd-repo:1.2.3' already exists."
    assert_mock_not_called npm install
    assert_mock_not_called docker build
}

@test "does't publish image if already published" {
    set_mock_state "image_published" "true"
    run containerize --push
    assert_success
    assert_output --partial \
        "Docker image 'ghcr.io/cicd-account/cicd-repo:1.2.3' already exists."
    assert_mock_not_called docker push
}

@test "installs npm dependencies" {
    run containerize
    assert_success
    assert_mock_called_once npm install
    assert_mock_called_in_dir app npm install
}

@test "rebuilds if local image exists" {
    set_mock_state "image_local" "true"
    run containerize --rebuild
    assert_success
    assert_mock_called_once npm install
    assert_mock_called_once docker build
}

@test "rebuilds if local image published" {
    set_mock_state "image_published" "true"
    run containerize --rebuild
    assert_success
    assert_mock_called_once npm install
    assert_mock_called_once docker build
}

@test "rebuilds and publishes if already published" {
    set_mock_state "image_published" "true"
    run containerize --rebuild --push
    assert_success
    assert_mock_called_once npm install
    assert_mock_called_once docker build
}

@test "installs npm dependencies before testing" {
    run containerize
    assert_success
    assert_mocks_called_in_order \
        npm install -- \
        npm run test
}

@test "runs tests" {
    run containerize
    assert_success
    assert_mock_called_once npm run test
    assert_mock_called_in_dir app npm run test
}

@test "builds SvelteKit application" {
    run containerize
    assert_success
    assert_mock_called_once npm run build
    assert_mock_called_in_dir app npm run build
}

@test "installs npm dependencies before building" {
    run containerize
    assert_success
    assert_mocks_called_in_order \
        npm install -- \
        npm run build
}

@test "builds container image" {
    run containerize
    assert_success
    assert_mock_called_once docker build \
        -f "Dockerfile" "."
}

@test "tags local container image" {
    run containerize
    assert_success
    assert_mock_called_once docker build \
        -t "cicd-repo:latest" \
        -t "cicd-repo:1.2.3"
}

@test "tags image with Github Package Registry namespace" {
    run containerize --push
    assert_success
    assert_mock_called_once docker build \
        -t "ghcr.io/cicd-account/cicd-repo:latest" \
        -t "ghcr.io/cicd-account/cicd-repo:1.2.3"
}

@test "labels image with version" {
    run containerize --push
    assert_success
    assert_mock_called_once docker build \
        --build-arg "VERSION=1.2.3"
}

@test "labels image with source" {
    run containerize --push
    assert_success
    assert_mock_called_once docker build \
        --build-arg "SOURCE=https://github.com/cicd-account/cicd-repo"
}

@test "pushes image to GitHub Package Registry" {
    run containerize --push
    assert_success
    assert_mock_called_times 2 docker push
    assert_mock_called_once docker push \
        "ghcr.io/cicd-account/cicd-repo:1.2.3"
    assert_mock_called_once docker push \
        "ghcr.io/cicd-account/cicd-repo:latest"
}
