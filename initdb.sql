-- disconnect all active users
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'tim_twitter'
	AND pid <> pg_backend_pid();

-- rebuild db from scratch
DROP DATABASE IF EXISTS tim_twitter;
CREATE DATABASE tim_twitter;

\c tim_twitter;

-- bootstrap data
CREATE TABLE users (
	ID SERIAL NOT NULL PRIMARY KEY,
	name VARCHAR NOT NULL,
	email VARCHAR UNIQUE NOT NULL,
	password VARCHAR NOT NULL,
	is_deleted BOOLEAN NOT NULL DEFAULT False
);

INSERT INTO users (name, email, password)
	VALUES ('timtest', 'timtest@timtest.com', 'hunter2');