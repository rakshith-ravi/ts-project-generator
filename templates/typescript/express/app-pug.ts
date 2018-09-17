import * as createError from 'http-errors';
import * as express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as favicon from 'serve-favicon';

import indexRouter from './routes/index';

// @if NODE_ENV=='development'
import * as sass from 'node-sass';
import { existsSync, readFileSync } from 'fs';
import { transpileModule } from 'typescript';
// @endif

var app = express();

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use(favicon(join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// @if NODE_ENV != 'production'
app.use((req, res, next) => {
	if (req.url.endsWith('.css')) {
		let cssLocation = join(__dirname, 'public', req.url);
		if (existsSync(cssLocation)) {
			res.writeHead(200, { "Content-Type": "text/css" });
			res.write(readFileSync(cssLocation));
			res.end();
		} else if (existsSync(cssLocation.replace(".css", ".scss"))) {
			try {
				let result = sass.renderSync({
					file: cssLocation.replace(".css", ".scss")
				});
				res.writeHead(200, { "Content-Type": "text/css" });
				res.write(result.css);
				res.end();
			} catch (err) {
				if (err) {
					next(err);
					return;
				}	
			}
		} else if (existsSync(cssLocation.replace(".css", ".sass"))) {
			try {
				let result = sass.renderSync({
					file: cssLocation.replace(".css", ".sass")
				});
				res.writeHead(200, { "Content-Type": "text/css" });
				res.write(result.css);
				res.end();
			} catch (err) {
				if (err) {
					next(err);
					return;
				}	
			}
		} else {
			next();
		}
	} else {
		next();
	}
});

app.use((req, res, next) => {
	if (req.url.endsWith('.js')) {
		let jsLocation = join(__dirname, 'public', req.url);
		if (existsSync(jsLocation)) {
			res.writeHead(200, { "Content-Type": "application/javascript" });
			res.write(readFileSync(jsLocation));
			res.end();
		} else if (existsSync(jsLocation.replace(".js", ".ts"))){
			let result = transpileModule(
				readFileSync(jsLocation.replace(".js", ".ts")).toString(),
				JSON.parse(readFileSync(join(__dirname, '..', 'tsconfig.json')).toString())
			);
			res.writeHead(200, { "Content-Type": "application/javascript" });
			res.write(result.outputText);
			res.end();
		} else {
			next();
		}
	} else {
		next();
	}
});
// @endif

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
