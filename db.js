const options = {};

const pgp = require('pg-promise')(options);
const monitor = require('pg-monitor');

const config = {
	host: 'localhost',
	port: 5432,
	database: 'tim_twitter',
};
const db = pgp(config);
monitor.attach(options);

module.exports = db;