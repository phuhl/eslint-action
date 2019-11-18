#!/bin/sh

set -e

npm -C package.lint.json

NODE_PATH=node_modules node /action/lib/run.js
