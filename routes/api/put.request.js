var crypto = require('crypto'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    ObjectID = require('mongodb').ObjectID;

const _Functions = require('../../src/modules/functions');
const _LOCAL_FUNCTIONS = {
  _throwNewInstanceError: (collectionName) => {
    const _COLLECTION_NAME_AS_SINGLE = (collectionName.match(/\w+s$/ig) != null)? collectionName.slice(0, -1): collectionName,
          RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`You\'ve not entered the required information to create a new ${_COLLECTION_NAME_AS_SINGLE}.`);

    return RECURSIVE_CONTENT;
  }
};

module.exports = (app, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY) => {
  app.put('/:collection/:token', (req, res) => {
    if (typeof req.params.collection != 'undefined'){
      const _COLLECTION_NAME = req.params.collection.toLowerCase(),
            _TODAY = new Date(),
            _TOKEN = req.params.token;

      var _THREAD = req.body,
          _IS_COLLECTION_READY_TO_UPDATE = false;

      switch (_COLLECTION_NAME) {
        case 'verify':
          switch (_TOKEN.toLowerCase()) {
            case 'phone-number':
            case 'phone':
            case 'mobile-phone':
            case 'mobile-phone-number':
            case 'mobile-number':
              if ((typeof _THREAD.user_id != 'undefined') || (typeof _THREAD._id != 'undefined') || (typeof _THREAD.user != 'undefined')){
                const _USER_ID = _THREAD.user_id || _THREAD._id || _THREAD.user;

                _THREAD.user_id = new ObjectID(_USER_ID);

                MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
                  if (connectionError != null){
                      const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection could not be reached.`, 700);

                      res.json(RECURSIVE_CONTENT);

                      client.close();
                    }else{
                      const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                            _COLLECTION = _DB.collection('users'),
                            _CRITERIA = {
                              _id: _THREAD.user_id
                            },
                            _TARGET = {
                              "$set": {
                                "phone.mobile.validation.value": true,
                                "phone.mobile.validation.modified_at": _TODAY
                              }
                            };

                      _COLLECTION.updateOne(_CRITERIA, _TARGET, function(verifyQueryError, doc){
                        if (verifyQueryError != null){
                          const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The 'users' collection update request could\'t be processed.`, 700);

                          res.json(RECURSIVE_CONTENT);
                        }else{
                          const RECURSIVE_CONTENT = _Functions._throwResponseWithData(doc);

                          res.json(RECURSIVE_CONTENT);

                          client.close();
                        }
                      });
                    }
                });
              }else{
                const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('You\'ve not entered the required information to verify number', 700);

                res.json(RECURSIVE_CONTENT);
              }
          break;

        default:
          const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

          res.json(RECURSIVE_CONTENT);
      }
      break;

      case 'regenerate':
        switch (_TOKEN.toLowerCase()) {
          case 'phone-number':
          case 'phone':
          case 'mobile-phone':
          case 'mobile-phone-number':
          case 'mobile-number':
            if ((typeof _THREAD.user_id != 'undefined') || (typeof _THREAD._id != 'undefined') || (typeof _THREAD.user != 'undefined')){
              const _USER_ID = _THREAD.user_id || _THREAD._id || _THREAD.user;

              _THREAD.user_id = new ObjectID(_USER_ID);

              MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
                if (connectionError != null){
                    const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection could not be reached.`, 700);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }else{
                    const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                          _COLLECTION = _DB.collection('users'),
                          _CRITERIA = {
                            _id: _THREAD.user_id
                          },
                          _VALIDATION_TOKEN = Math.floor(Math.random() * ((999999 - 100000) + 1) + 100000).toString();

                    var _TARGET = {
                      "$set": {
                        "phone.mobile.validation.token": _VALIDATION_TOKEN,
                        "phone.mobile.validation.modified_at": _TODAY
                      }
                    };

                    if (typeof _THREAD.phone_number != 'undefined'){
                      _TARGET["phone.mobile.content"] = _THREAD.phone_number;
                    }

                    _COLLECTION.updateOne(_CRITERIA, _TARGET, function(regenerateQueryError, doc){
                      if (regenerateQueryError != null){
                        const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The 'users' collection update request could\'t be processed.`, 700);

                        res.json(RECURSIVE_CONTENT);
                      }else{
                        _Functions._sendMessage(_THREAD.phone_number, _VALIDATION_TOKEN)
                        .then((response) => {
                          var RECURSIVE_OBJECT = {
                            token: _VALIDATION_TOKEN,
                            modified_at: _TODAY
                          };

                          if (typeof _THREAD.phone_number != 'undefined'){
                            RECURSIVE_OBJECT.phone_number = _THREAD.phone_number;
                          }

                          const RECURSIVE_CONTENT = _Functions._throwResponseWithData(RECURSIVE_OBJECT);

                          res.json(RECURSIVE_CONTENT);
                        })
                        .catch((error) => {
                          const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(error.message, error.status);

                          res.json(RECURSIVE_CONTENT);
                        })

                        client.close();
                      }
                    });
                  }
              });
            }else{
              const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('You\'ve not entered the required information to verify number', 700);

              res.json(RECURSIVE_CONTENT);
            }
        break;

      default:
        const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('The name of your desired token has not been defined.');

        res.json(RECURSIVE_CONTENT);
    }
    break;

    default:
      const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('The name of your desired token has not been defined.');

      res.json(RECURSIVE_CONTENT);
    }

      if (_IS_COLLECTION_READY_TO_UPDATE){
        // _THREAD.modified_at = _THREAD.created_at = _TODAY;
        //
        // MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
        //   if (connectionError != null){
        //       const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection could not be reached.`, 700);
        //
        //       res.json(RECURSIVE_CONTENT);
        //
        //       client.close();
        //     }else{
        //       const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
        //             _COLLECTION = _DB.collection(_COLLECTION_NAME);
        //
        //       _COLLECTION.insert(_THREAD, function(updateQueryError, doc){
        //         if (updateQueryError != null){
        //           const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection insert request could\'t be processed.`, 700);
        //
        //           res.json(RECURSIVE_CONTENT);
        //         }else{
        //           const RECURSIVE_CONTENT = _Functions._throwResponseWithData(doc);
        //
        //        res.json(RECURSIVE_CONTENT);
        //
        //        client.close();
        //         }
        //       });
        //     }
        // });
      }
    }
  });
};
