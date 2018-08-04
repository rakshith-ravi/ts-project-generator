import * as createError from 'http-errors';
import * as express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';

import indexRouter from './routes/index';

var app = express();

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
	next(createError(404));
});

// error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);

	// Handle the error here
});

export default app;
