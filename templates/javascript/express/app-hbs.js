var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

// @if NODE_ENV=='development'
var sass = require('node-sass');
// @endif

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// @if NODE_ENV != 'production'
app.use((req, res, next) => {
	if(req.url.endsWith('.css')) {
		sass.render({
			file: join(__dirname, 'public', req.url.replace('css', 'scss'))
		}, (err, result) => {
			if(err) {
				next(err);
				return;
			}
			res.writeHead(200, { "Content-Type": "text/css" });
			res.write(result.css);
			res.end();
		});
	} else {
		next();
	}
});
// @endif

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res, _next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);

	// Handle the error here
});

module.exports = app;
