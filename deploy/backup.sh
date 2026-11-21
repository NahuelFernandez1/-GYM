#!/bin/sh
# Daily Postgres dump, keeps the last 14. Install with:
#   (crontab -l; echo "0 4 * * * /opt/masgym/deploy/backup.sh") | crontab -
set -e
cd "$(dirname "$0")/.."
mkdir -p backups
. ./.env
docker compose exec -T db pg_dump -U "$DB_USERNAME" -d masgym -Fc > "backups/masgym-$(date +%F).dump"
ls -1t backups/masgym-*.dump | tail -n +15 | xargs -r rm --
