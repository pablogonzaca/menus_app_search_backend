var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, {native_parser: true});
db.bind('users');
db.bind('restaurants');

var service = {};

service.authenticate = authenticate;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
service.getRestaurants = getRestaurants;
service.getMenu = getMenu;
service.comment = comment;

module.exports = service;

function authenticate(username, password) {
    var deferred = Q.defer();

    db.users.findOne({email: username}, function (err, user) {

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
    _id = jwt.verify(bearer, config.secret).token;
    db.users.findById(_id, function (err, user) {
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

function getRestaurants(params) {
    var deferred = Q.defer();
    //_id = jwt.verify(bearer, config.secret).token;
    db.restaurants.find({
        'location.latitude': {$gt: parseFloat(params.lat) - 0.010, $lt: parseFloat(params.lat) + 0.010},
        'location.longitude': {$gt: parseFloat(params.lng) - 0.010, $lt: parseFloat(params.lng) + 0.010}
    })
        .toArray(function (err, restaurants) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            if (restaurants) {
                deferred.resolve(restaurants);
            } else {
                deferred.resolve();
            }
        });

    return deferred.promise;
}

function getMenu(params) {
    var deferred = Q.defer();
    //_id = jwt.verify(bearer, config.secret).token;

    db.restaurants.findById(params.id, function (err, restaurant) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (restaurant) {
            // return user (without hashed password)
            deferred.resolve(restaurant);
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
    db.users.findOne(
        {username: userParam.name},
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                // username already exists
                deferred.reject('Username "' + userParam.username + '" is already taken');
            } else {
                createUser();
            }
        });

    function createUser() {
        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'password');

        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);

        db.users.insert(
            user,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();
    _id = jwt.verify(bearer, config.secret).token;
    // validation
    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user.username !== userParam.username) {
            // username has changed so check if the new username is already taken
            db.users.findOne(
                {username: userParam.username},
                function (err, user) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (user) {
                        // username already exists
                        deferred.reject('Username "' + req.body.username + '" is already taken')
                    } else {
                        updateUser();
                    }
                });
        } else {
            updateUser();
        }
    });

    function updateUser() {
        // fields to update
        var set = {
            firstName: userParam.firstName,
            lastName: userParam.lastName,
            username: userParam.username,
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        db.users.update(
            {_id: mongo.helper.toObjectID(_id)},
            {$set: set},
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.users.remove(
        {_id: mongo.helper.toObjectID(_id)},
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function comment(commentParam) {
    var deferred = Q.defer();
    db.comment.insert(commentParam, function (err) {
        if (err) deferred.reject(err.name + ': ' + err.message)
        deferred.resolve();
    });
    return deferred.promise;
}

