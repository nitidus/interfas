var crypto = require('crypto'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    ObjectID = require('mongodb').ObjectID,
    fs = require('fs'),
    path = require('path');

module.exports = (app, CONNECTION_URL, INTERFAS_KEY) => {
  app.post('/user', (req, res) => {
    if ((typeof req.body.personal != 'undefined') && (typeof req.body.userGroup != 'undefined') && (typeof req.body.password != 'undefined') && ((typeof req.body.email != 'undefined') || (typeof req.body.phone != 'undefined'))){
      // var _user = req.body;
      
      res.json({
        hello: 'World!'
      })
    }else{
      res.json({
        meta: {
          code: 600,
          error_type: 'BadRequestException',
          error_message: 'You\'ve not entered the information needed to create a new user.'
        }
      });
    }
  });
};
