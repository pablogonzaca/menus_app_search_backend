var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

router.get('/', function (req, res) {
    return res.redirect('/registerUser');
});

router.post('/', function (req, res) {
    // register using api to maintain clean separation between layers
    request.post({
        url: config.apiUrl + '/users/register',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            return res.send({ error: 'An error occurred'});
        }

        if (response.statusCode !== 200) {
            return res.send({ error: response.body });
        }

        // return to login page
        return res.redirect('/loginUser');
    });
});

module.exports = router;