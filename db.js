const pgp = require('pg-promise')({});

const config = {
	host: 'localhost',
	port: 5432,
	database: 'tim_twitter',
};
const db = pgp(config);

module.exports = db;