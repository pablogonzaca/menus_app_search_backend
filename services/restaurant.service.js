var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('restaurants');

var service = {};

service.authenticate = authenticate;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

function authenticate(email, password) {
    var deferred = Q.defer();

    db.restaurants.findOne({ email: email }, function (err, user) {

        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve(jwt.sign({token: user._id}, config.secret));
        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getById(bearer) {
    var deferred = Q.defer();
    _id = jwt.verify(bearer, config.secret).token
    db.restaurants.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(userParam) {
    var deferred = Q.defer();

    // validation
    db.restaurants.findOne(
        { username: userParam.name },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                // username already exists
                deferred.reject('Restaurant name "' + userParam.username + '" is already taken');
            } else {
                createRestaurant();
            }
        });

    function createRestaurant() {
        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'password');

        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);

        db.restaurants.insert(
            user,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(bearer, userParam) {
    var deferred = Q.defer();
    _id = jwt.verify(bearer, config.secret).token;
    // validation
    db.restaurants.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user.username !== userParam.username) {
            // username has changed so check if the new username is already taken
            db.restaurants.findOne(
                { username: userParam.username },
                function (err, user) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (user) {
                        // username already exists
                        deferred.reject('Restaurant name "' + req.body.username + '" is already taken')
                    } else {
                        updateRestaurant();
                    }
                });
        } else {
            updateRestaurant();
        }
    });

    function updateRestaurant() {
        var set = {};

        // update password if it was entered
        // if (userParam.password) {
        //     set.hash = bcrypt.hashSync(userParam.password, 10);
        // }
        if(userParam.menu && userParam.menu.length > 0){
            set.menu = userParam.menu;
        }
        if(userParam.location){
            set.location = userParam.location;
        }

        db.restaurants.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.restaurants.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}