#!/usr/bin/env bash
set -euo pipefail

DIST_DIR="dist"
ARCHIVE="oachkatzl-docs.tar.gz"

echo "==> Installing dependencies..."
npm ci --silent

echo "==> Building static site..."
npm run build

echo "==> Packaging into ${ARCHIVE}..."
rm -f "${ARCHIVE}"
tar -czf "${ARCHIVE}" -C build .

echo ""
echo "Done. Upload ${ARCHIVE} to your webserver and extract it under the /docs/ path:"
echo ""
echo "  scp ${ARCHIVE} user@host:/tmp/"
echo "  ssh user@host 'mkdir -p /var/www/oachkatzl/docs && tar -xzf /tmp/${ARCHIVE} -C /var/www/oachkatzl/docs'"
echo ""
