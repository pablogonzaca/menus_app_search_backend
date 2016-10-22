var config = require('config.json');
var express = require('express');
var multer = require('multer')
var upload = multer({dest: 'public/images'})
var router = express.Router();
var restaurantService = require('services/restaurant.service');

// routes
router.post('/authenticate', authenticateRestaurant);
router.post('/register', registerRestaurant);
router.get('/current', getCurrentRestaurant);
router.put('/:_id', updateRestaurant);
router.delete('/:_id', deleteRestaurant);
router.post('/uploadImages', upload.array('fileUpload', 5), uploadImages);

module.exports = router;

function authenticateRestaurant(req, res) {
    restaurantService.authenticate(req.body.email, req.body.password)
        .then(function (token) {
            if (token) {
                // authentication successful
                req.session.token = token;
                res.send({token: token});
            } else {
                // authentication failed
                res.status(401).send('Restaurant email or password is incorrect');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function registerRestaurant(req, res) {
    restaurantService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentRestaurant(req, res) {
    var bearer = req.headers["authorization"].substring(req.headers["authorization"].indexOf(" ") + 1);
    restaurantService.getById(bearer)
        .then(function (restaurant) {
            if (restaurant) {
                res.send(restaurant);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateRestaurant(req, res) {
    var bearer = req.headers["authorization"].substring(req.headers["authorization"].indexOf(" ") + 1);
    restaurantService.update(bearer, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteRestaurant(req, res) {
    var restaurantId = req.restaurant.sub;
    if (req.params._id !== restaurantId) {
        // can only delete own account
        return res.status(401).send('You can only delete your own account');
    }

    restaurantService.delete(restaurantId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function uploadImages(req, res) {
    console.log(req.files);
    res.sendStatus(200);
}
