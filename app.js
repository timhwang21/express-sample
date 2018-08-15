var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.all('/*', (req, res) => {
	res.status(404).json({
		errors: [
			{
				status: 404,
				source: {
					pointer: req.url,
				},
				title: 'Route not found',
				detail: `'${req.method} on ${req.url} not found'`,
			},
		],
	})
})

module.exports = app;
