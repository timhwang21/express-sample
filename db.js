const pgp = require('pg-promise')({});
const connectionString = 'postgres://localhost:5432/tim_twitter';
const db = pgp(connectionString);

module.exports = db;