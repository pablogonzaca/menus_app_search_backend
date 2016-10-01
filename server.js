require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var router = express.Router();
var config = require('config.json');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));

// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).
    unless({ path: ['/api/users/authenticate', '/api/users/register', '/api/restaurants/authenticate', '/api/restaurants/register'] }));

// routes
app.use('/loginUser', require('./controllers/login.controller.user'));
app.use('/registerUser', require('./controllers/register.controller.user'));
app.use('/api/users', require('./controllers/api/users.controller'));

app.use('/loginRestaurant', require('./controllers/login.controller.restaurant'));
app.use('/registerRestaurant', require('./controllers/register.controller.restaurant'));
app.use('/api/restaurants', require('./controllers/api/restaurants.controller'));

router.get('/token', function (req, res) {
    res.send(req.session.token);
});

// start server
var server = app.listen(3000, function () {
    console.log('Server listening at http://localhost'  + ':' + server.address().port);
});