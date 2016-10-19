var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

router.get('/', function (req, res) {
    return res.redirect('/registerRestaurant');
});

router.post('/', function (req, res) {
    // register using api to maintain clean separation between layers
    request.post({
        url: config.apiUrl + '/restaurants/register',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            return res.send({ error: 'An error occurred' });
        }

        if (response.statusCode !== 200) {
            return res.send({ error: response.body });
        }
        return res.send(body);

        // return to login page
        // res.redirect('/loginRestaurant');
    });
});

module.exports = router;