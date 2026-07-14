#!/usr/bin/env bash
set -euo pipefail
# Allocate a free TCP port and print it.
python3 - <<'PY'
import socket
s = socket.socket()
s.bind(("127.0.0.1", 0))
print(s.getsockname()[1])
s.close()
PY
