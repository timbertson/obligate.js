#!/bin/bash

here="$(dirname "$0")"
cd "$here"
set -ex
make
NODE_PATH="./0cache" ./index.js
APOLLO_INIT="./obligate-modules-apollo.js" ./index.sjs
which chromium-browser
(chromium-browser ./index.html
chromium-browser ./index-apollo.html) 2>/dev/null
