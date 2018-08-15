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