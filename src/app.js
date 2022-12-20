const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const index = require('./routes/index');
const dashboard = require('./routes/dashboard');
const createShipping = require('./routes/create-shipping');

const app = express();

// view engine setup jaddas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.locals.basedir = path.join(__dirname, 'views');

// uncomment after placing your favicon in /public
////app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/javascripts', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/js')));
app.use('/javascripts', express.static(path.join(__dirname, '../node_modules/masonry-layout/dist')));

app.use(logger('dev'));

app.use(session({
	secret: 'foo',
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 3600000 }	// 1 minute = 60 units
}));

app.use('/', index);
app.use('/panel', dashboard);
app.use('/crear-envio', createShipping);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	if (err.status === 404)
		err.message = 'Página no encontrada';
	
	// send error message if POST request
	if (req.method === 'POST') {
		res.json({ 
			
			response: 'ERROR',
			message: err.message, 
		});
	}
	else if (req.app.get('env') === 'development') {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};
	
		// render the error page
		res.status(err.status || 500);
		res.render('error');
	}
	else {
		res.redirect('/');
	}
});

module.exports = app;
