#!/bin/sh
echo "--- Frontend Startup Sequence ---"
# ❌ npx prisma generate 줄을 삭제하세요
echo "--- Starting Frontend Server ---"
exec "$@"