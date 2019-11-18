#!/bin/sh

set -e

npm install  eslint eslint-config-prettier eslint-config-react-app eslint-loader eslint-plugin-flowtype eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-simple-import-sort

NODE_PATH=node_modules node /action/lib/run.js
