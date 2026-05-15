#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/srv/personal-web}"
REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-main}"
BACKEND_SERVICE="${BACKEND_SERVICE:-personal-web-backend}"
PUBLIC_URL="${PUBLIC_URL:-http://47.99.200.227}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:8000/api/health}"
FETCH_TIMEOUT="${FETCH_TIMEOUT:-180}"

log() {
  printf '\n==> %s\n' "$*"
}

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

wait_for_url() {
  local url="$1"
  local label="$2"
  local response=""

  for _ in $(seq 1 30); do
    if response="$(curl -fsS "${url}" 2>/dev/null)"; then
      printf '%s\n' "${response}"
      return 0
    fi
    sleep 1
  done

  echo "Timed out waiting for ${label}: ${url}" >&2
  return 1
}

uv_command() {
  if command -v uv >/dev/null 2>&1; then
    uv "$@"
    return
  fi

  if sudo -n test -x /root/.local/bin/uv; then
    sudo -n /root/.local/bin/uv "$@"
    return
  fi

  echo "Missing uv. Install uv for this user or root before running deployment." >&2
  exit 1
}

if [[ ! -d "${PROJECT_DIR}/.git" ]]; then
  echo "Project repo not found: ${PROJECT_DIR}" >&2
  exit 1
fi

need git
need npm
need curl
need sudo

cd "${PROJECT_DIR}"
git config --global --add safe.directory "${PROJECT_DIR}" >/dev/null 2>&1 || true

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  log "Stashing tracked local changes before deploy"
  git stash push -m "codex deploy stash $(date -Iseconds)"
fi

log "Fetching ${REMOTE}/${BRANCH}"
if command -v timeout >/dev/null 2>&1; then
  timeout "${FETCH_TIMEOUT}" git fetch "${REMOTE}" "${BRANCH}"
else
  git fetch "${REMOTE}" "${BRANCH}"
fi
git checkout "${BRANCH}"
git merge --ff-only "${REMOTE}/${BRANCH}"

log "Updating submodules"
git submodule sync --recursive
git submodule update --init --recursive

log "Installing frontend dependencies"
npm ci

log "Building static output"
npm_config_ignore_scripts="${NPM_CONFIG_IGNORE_SCRIPTS:-true}" \
  BOOK_READER_NPM_IGNORE_SCRIPTS="${BOOK_READER_NPM_IGNORE_SCRIPTS:-1}" \
  npm run build

log "Syncing backend dependencies"
cd "${PROJECT_DIR}/backend"
uv_command sync
sudo chown -R "$(id -un):$(id -gn)" "${PROJECT_DIR}/backend/.venv" 2>/dev/null || true

log "Restarting backend service"
sudo systemctl restart "${BACKEND_SERVICE}"

log "Reloading nginx"
sudo nginx -t
sudo systemctl reload nginx

log "Verifying service"
wait_for_url "${HEALTH_URL}" "backend health"
index_asset="$(curl -fsS "${PUBLIC_URL}" | grep -o 'assets/index-[^"]*\.js' | head -1 || true)"
if [[ -z "${index_asset}" ]]; then
  echo "Could not find built frontend index asset at ${PUBLIC_URL}" >&2
  exit 1
fi
printf '%s\n' "${index_asset}"

log "Deployed $(git -C "${PROJECT_DIR}" rev-parse --short HEAD)"
