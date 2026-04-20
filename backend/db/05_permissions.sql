-- 3. Grant privileges to read-only role
GRANT CONNECT ON DATABASE "text-to-sql-db" TO db_reader;
GRANT USAGE ON SCHEMA public TO db_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO db_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO db_reader;
