const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('winston');
const sass = require('node-sass-middleware');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const cookieParser = require('cookie-parser');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const authentication = require('./authentication');

const mongoose = require('./mongoose');

const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(
  sass({
    src: path.join(__dirname, '../scss/'),
    dest: path.join(__dirname, '../public/assets/styles/'),
    debug: false,
    force: true,
    outputStyle: 'compressed',
    prefix: '/static/assets/styles/'
  })
);

// Host the public folder
app.use('/static', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio());

app.configure(mongoose);

// Configure other middleware (see `middleware/index.js`)
app.configure(authentication);
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({
  logger,
  html: function(error, req, res, next) {
    error.message = error.message.substr(error.length - 1) === '.' ? error.message : error.message + '.';
    res.render('error', error);
  }
}));

app.hooks(appHooks);

module.exports = app;
