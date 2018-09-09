# Basic REST Server Example

## Steps

### Database

```bash
$ brew install postgres
$ psql
$ CREATE DATABASE my_crud_app;
$ \c my_crud_app;
$ # make your tables
$ CREATE TABLE users (id SERIAL NOT NULL PRIMARY KEY, name VARCHAR NOT NULL);
$ INSERT INTO users (name) ('timtest');
```

### Server

```bash
$ npm install -g express-generator
$ express --no-view --git my-crud-app
$ cd my-crud-app && yarn add pg-promise
# Set up pgp() connection to host: localhost, port: 5432, database: my_crud_app
# Configure routes
```

## Implementation Notes

### Database

`db.js` handles connection to a Postgres database on port 5432, which is the default for Postgres. `initdb.sql` is a bootstrapping script for setting up a test database.

I used `pg-promise` because it's the one I think is best, but it doesn't really matter what database connector you use. You can even use nosql.

### Server

The only change we made to `app.js` is the addition of a catch-all 404 handler route.

#### Users

A generic RESTful CRUD API.

Some patterns I like:

* `router.route()` for Rails controller-like organization of "generic" endpoints
* `router.VERB()` ONLY for one-off routes that support a single method
* Request params and body should be destructured at the top of every route, which also serves as documentation.

Some notes:

* Routes should have both regex-based and validation library (TODO) based validation.
* Error handling is ESSENTIAL. Make sure you can show that your app doesn't just expect everything to go perfectly.

## Suggestions

This represents what a sample "practical" coding interview question might ask for. I feel this is fairly representative of what an entry level web developer should be capable of doing.

Problem statement: build me a RESTful backend (with some toy schema). The interviewer may be very specific, or not specific at all. Be prepared to ask clarifying questions.

* Be familiar with basic HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
* Be familiar with the most common response statuses (200, 400, 500; what's the difference between 5xx and 4xx).
* Be able to set up a database, and implement a verbal description of a simple schema (`CREATE DATABASE`, `CREATE TABLE`, etc.).
* Be able to connect your database with your server (doesn't matter if Rails, Express, etc. See `db.js` for what this might look like.).
* Be able to connect your backend with a frontend (doesn't matter how rudimentary).
* Be able to explain what MVC is in 30 seconds.
* Be able to explain what REST is in 30 seconds.