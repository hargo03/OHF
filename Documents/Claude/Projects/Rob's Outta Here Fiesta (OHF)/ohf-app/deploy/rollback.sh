#!/bin/bash
set -euo pipefail

if [ ! -L /opt/ohf/previous ]; then
  echo "No previous release is available."
  exit 1
fi

previous_target="$(readlink -f /opt/ohf/previous)"

if [ -z "$previous_target" ] || [ ! -d "$previous_target" ]; then
  echo "Previous release target is invalid."
  exit 1
fi

current_target=""
if [ -L /opt/ohf/current ]; then
  current_target="$(readlink -f /opt/ohf/current || true)"
fi

ln -sfn "$previous_target" /opt/ohf/current

if [ -n "$current_target" ] && [ "$current_target" != "$previous_target" ]; then
  ln -sfn "$current_target" /opt/ohf/previous
fi

systemctl restart ohf
systemctl status ohf --no-pager

echo "Rolled back to $previous_target"