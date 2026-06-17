-- CRM microservice owns its own schema on the shared MySQL instance.
-- Runs only on first container init (empty data dir). For existing installs, create manually:
--   docker exec law-app-mysql mysql -uroot -p<pwd> -e "CREATE DATABASE IF NOT EXISTS law_app_crm; GRANT ALL ON law_app_crm.* TO 'lawapp'@'%';"
CREATE DATABASE IF NOT EXISTS law_app_crm
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON law_app_crm.* TO 'lawapp'@'%';
FLUSH PRIVILEGES;
