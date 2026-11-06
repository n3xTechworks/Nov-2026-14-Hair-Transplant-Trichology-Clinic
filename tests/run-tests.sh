#!/usr/bin/env bash
# Runs the validator unit tests and the full-site QA for Hair Transplant & Trichology Clinic. Usage: bash tests/run-tests.sh [--quick]
set -u
cd "$(dirname "$0")/.."
status=0
echo "== Unit tests (node:test) =="
node --test tests/validation.test.js || status=1
echo
echo "== Site QA (Playwright) =="
node tests/qa.cjs "$(pwd)" "$@" || status=1
exit $status

