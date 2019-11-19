#!/bin/sh

set -e
rm package.json
npm install  eslint eslint-plugin-jsx-a11y eslint-plugin-react @actions/github

NODE_PATH=node_modules node /action/lib/run.js
