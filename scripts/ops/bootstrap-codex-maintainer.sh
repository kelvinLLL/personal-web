#!/usr/bin/env bash
set -Eeuo pipefail

MAINTAINER_USER="${MAINTAINER_USER:-codex-deploy}"
PROJECT_DIR="${PROJECT_DIR:-/srv/personal-web}"
PUBLIC_KEY="${CODEX_DEPLOY_PUBLIC_KEY:-ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEnRuxSpXJCNUnj5/WiVgeloPn1GHBN9Ku6/Qw4ujUsK codex-aliyun-personal-web-2026-04-26}"
SUDOERS_FILE="/etc/sudoers.d/${MAINTAINER_USER}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root, for example: sudo bash scripts/ops/bootstrap-codex-maintainer.sh" >&2
  exit 1
fi

if ! id "${MAINTAINER_USER}" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash --groups sudo "${MAINTAINER_USER}"
else
  usermod --shell /bin/bash "${MAINTAINER_USER}"
  usermod --append --groups sudo "${MAINTAINER_USER}"
fi

home_dir="$(getent passwd "${MAINTAINER_USER}" | cut -d: -f6)"
install -d -m 700 -o "${MAINTAINER_USER}" -g "${MAINTAINER_USER}" "${home_dir}/.ssh"

authorized_keys="${home_dir}/.ssh/authorized_keys"
touch "${authorized_keys}"
if ! grep -qxF "${PUBLIC_KEY}" "${authorized_keys}"; then
  printf '%s\n' "${PUBLIC_KEY}" >> "${authorized_keys}"
fi

chown "${MAINTAINER_USER}:${MAINTAINER_USER}" "${authorized_keys}"
chmod 600 "${authorized_keys}"

printf '%s\n' "${MAINTAINER_USER} ALL=(ALL) NOPASSWD:ALL" > "${SUDOERS_FILE}"
chmod 440 "${SUDOERS_FILE}"
visudo -cf "${SUDOERS_FILE}" >/dev/null

if [[ -d "${PROJECT_DIR}" ]]; then
  chown -R "${MAINTAINER_USER}:${MAINTAINER_USER}" "${PROJECT_DIR}"
  sudo -u "${MAINTAINER_USER}" git config --global --add safe.directory "${PROJECT_DIR}" >/dev/null 2>&1 || true
fi

echo "Maintainer user is ready: ${MAINTAINER_USER}"
echo "Project directory: ${PROJECT_DIR}"
