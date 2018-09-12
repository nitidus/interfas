var crypto = require('crypto'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    ObjectID = require('mongodb').ObjectID,
    fs = require('fs'),
    path = require('path');

const _Functions = require('../../src/modules/functions');

module.exports = (app, CONNECTION_URL, INTERFAS_KEY) => {
  app.post('/:collection', (req, res) => {
    if (typeof req.params.collection != 'undefined'){
      const _COLLECTION_NAME = req.params.collection.toLowerCase(),
            _TODAY = new Date();

      var _THREAD = req.body,
          _IS_COLLECTION_READY_TO_ABSORB = false;

      switch (_COLLECTION_NAME) {
        case 'users':
          if ((typeof _THREAD.personal != 'undefined') && (typeof _THREAD.user_group != 'undefined') && (typeof _THREAD.password != 'undefined') && ((typeof _THREAD.email != 'undefined') || (typeof _THREAD.phone != 'undefined'))){
            const _SECRET_CONTENT_OF_PASSWORD = crypto.createCipher('aes192', _THREAD.password),
                  _SECRET_CONTENT_OF_PASSWORD_WITH_APPENDED_KEY = `${_SECRET_CONTENT_OF_PASSWORD.update(INTERFAS_KEY, 'utf8', 'hex')}${_SECRET_CONTENT_OF_PASSWORD.final('hex')}`;

            _THREAD.password = _SECRET_CONTENT_OF_PASSWORD_WITH_APPENDED_KEY;

            if (typeof _THREAD.email != 'undefined'){
              const _SECRET_CONTENT_OF_TOKEN = `${_TODAY.getTime()}${Math.random()}${_THREAD.email}${_THREAD.password}`,
                    _SECRET_CONTENT_OF_TOKEN_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_SECRET_CONTENT_OF_TOKEN).digest('hex');

              _THREAD.email = {
                content: _THREAD.email,
                validation: {
                  token: _SECRET_CONTENT_OF_TOKEN_WITH_APPENDED_KEY,
                  value: false
                }
              };
            }

            if (typeof _THREAD.phone != 'undefined') {
              if (typeof _THREAD.phone.mobile != 'undefined'){
                _THREAD.phone.mobile = {
                  content: _THREAD.phone.mobile,
                  validation: {
                    token: Math.floor(Math.random() * ((999999 - 100000) + 1) + 100000).toString(),
                    value: false
                  }
                };
              }
            }

            _THREAD.user_group_id = new ObjectID(_THREAD.user_group_id);

            _IS_COLLECTION_READY_TO_ABSORB = true;
          }else{
            const _COLLECTION_NAME_AS_SINGLE = (_COLLECTION_NAME.match(/\w+s$/ig) != null)? _COLLECTION_NAME.slice(0, -1): _COLLECTION_NAME,
                  RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`You\'ve not entered the required information to create a new ${_COLLECTION_NAME_AS_SINGLE}.`);

            res.json(RECURSIVE_CONTENT);
          }
          break;

        case 'endusers':
          _THREAD.viewed = 0;
          _THREAD.user_id = new ObjectID(_THREAD.user_id);

          _IS_COLLECTION_READY_TO_ABSORB = true;
          break;

        default:
          const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

          res.json(RECURSIVE_CONTENT);
      }

      if (_IS_COLLECTION_READY_TO_ABSORB){
        _THREAD.modified_at = _THREAD.created_at = _TODAY;

        MongoClient.connect(CONNECTION_URL, function(connectionError, db){
          if (connectionError != null){
              const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection could not be reached.`, 700);

              res.json(RECURSIVE_CONTENT);
            }else{
              db.collection(_COLLECTION_NAME).insert(_THREAD, function(userInsertQueryError, doc){
                if (userInsertQueryError != null){
                  const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection insert request could\'t be processed.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  if (doc.insertedCount != 1){
                    const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The document in ${_COLLECTION_NAME} collection could\'t be inserted.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = _Functions._throwResponseWithData(doc);

                    res.json(RECURSIVE_CONTENT);

                    db.close();
                  }
                }
              });
            }
        });
      }
    }
  });
};
