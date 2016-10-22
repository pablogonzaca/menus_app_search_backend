var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');

// routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.post('/comment', commentUser);
router.get('/current', getCurrentUser);
router.get('/restaurants/:lat/:lng', getRestaurants);
router.get('/menu/:id', getMenu);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);

module.exports = router;

function commentUser(req, res) {

    console.log(req);

    userService.comment(req.body);
    then(function () {
        res.sendStatus(200);
    }).catch(function (err) {
        res.status(400).send(err);
    });
}

function authenticateUser(req, res) {
    userService.authenticate(req.body.email, req.body.password)
        .then(function (token) {
            if (token) {
                // authentication successful
                res.send({token: token});
            } else {
                // authentication failed
                res.status(401).send('Username or password is incorrect');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });

}

function registerUser(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentUser(req, res) {
    var bearer = req.headers["authorization"].substring(req.headers["authorization"].indexOf(" ") + 1);
    userService.getById(bearer)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getRestaurants(req, res) {
    var bearer = req.headers["authorization"].substring(req.headers["authorization"].indexOf(" ") + 1);
    userService.getRestaurants(req.params)
        .then(function (restaurants) {
            if (restaurants) {
                res.send(restaurants);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getMenu(req, res) {
    var bearer = req.headers["authorization"].substring(req.headers["authorization"].indexOf(" ") + 1);
    userService.getMenu(req.params)
        .then(function (menus) {
            if (menus) {
                res.send(menus);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only update own account
        return res.status(401).send('You can only update your own account');
    }

    userService.update(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only delete own account
        return res.status(401).send('You can only delete your own account');
    }

    userService.delete(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}