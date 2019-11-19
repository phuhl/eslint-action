#!/bin/sh

set -e
rm package.json
npm install  eslint eslint-plugin-jsx-a11y eslint-plugin-react

NODE_PATH=node_modules node /action/lib/run.js
