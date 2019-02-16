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
  },
  _throwConnectionError: () => {
    const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The Interfas collection could not be reached.`, 700);

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
          _IS_COLLECTION_READY_TO_UPDATE = false,
          _CRITERIA = [];

      if (typeof _THREAD._id != 'undefined') {
        delete _THREAD._id;
      }

      MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
        if (connectionError != null){
            res.json(_LOCAL_FUNCTIONS._throwConnectionError());
          }else{
            var _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                _COLLECTION = _DB.collection(_COLLECTION_NAME);

            switch (_COLLECTION_NAME) {
              case 'users':
                var _TARGET = {},
                    _IS__LOCAL_COLLECTION_READY_TO_UPDATE = true;

                if (typeof _THREAD.password != 'undefined'){
                  const _SECRET_CONTENT_OF_PASSWORD = crypto.createCipher('aes192', _THREAD.password),
                        _SECRET_CONTENT_OF_PASSWORD_WITH_APPENDED_KEY = `${_SECRET_CONTENT_OF_PASSWORD.update(INTERFAS_KEY, 'utf8', 'hex')}${_SECRET_CONTENT_OF_PASSWORD.final('hex')}`;

                  _TARGET.password = _SECRET_CONTENT_OF_PASSWORD_WITH_APPENDED_KEY;
                }

                if (typeof _THREAD.email != 'undefined'){
                  const _SECRET_CONTENT_OF_TOKEN = `${_TODAY.getTime()}${Math.random()}${_THREAD.email}${_THREAD.password}`,
                        _SECRET_CONTENT_OF_TOKEN_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_SECRET_CONTENT_OF_TOKEN).digest('hex');

                  _TARGET.email = {
                    content: _THREAD.email,
                    validation: {
                      token: _SECRET_CONTENT_OF_TOKEN_WITH_APPENDED_KEY,
                      value: false
                    }
                  };
                }

                if (typeof _THREAD.phone != 'undefined') {
                  _TARGET.phone = {};

                  if (typeof _THREAD.phone.mobile != 'undefined'){
                    _TARGET.phone.mobile = {
                      content: _THREAD.phone.mobile,
                      validation: {
                        token: Math.floor(Math.random() * ((999999 - 100000) + 1) + 100000).toString(),
                        value: false,
                        created_at: _TODAY,
                        modified_at: _TODAY
                      }
                    };

                    _Functions._sendMessage(_TARGET.phone.mobile.content, _TARGET.phone.mobile.validation.token)
                    .then((response) => {
                      //YOU CAN STORE YOUR RESPONSE IN DB
                    })
                    .catch((error) => {
                      const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(error.message, error.status);

                      res.json(RECURSIVE_CONTENT);
                    })
                  }
                }

                _TARGET.modified_at = _TODAY;

                _CRITERIA = {
                  _id: new ObjectID(_TOKEN)
                };

                if ((typeof _THREAD.personal.profile != 'undefined') || (typeof _THREAD.profile != 'undefined') || (typeof _THREAD.profile_photo != 'undefined') || (typeof _THREAD.profilePhoto != 'undefined')){
                  const _PROFILE_DIRECTORY = _THREAD.personal.profile || _THREAD.profile || _THREAD.profile_photo || _THREAD.profilePhoto;

                  _COLLECTION.findOne(_CRITERIA, function(existingCheckQueryError, existingDoc){
                    if (existingCheckQueryError != null){
                      const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(existingCheckQueryError, 700);

                      res.json(RECURSIVE_CONTENT);

                      _IS__LOCAL_COLLECTION_READY_TO_UPDATE = false;
                    }else{
                      const _SECRET_CONTENT_OF_FILE_NAME = `${_TODAY.getTime()}${Math.random()}${_TARGET.password}`,
                            _SECRET_CONTENT_OF_FILE_EXTENDED_PATH = `${_TODAY.getTime()}${_TARGET.password}`,
                            _SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_SECRET_CONTENT_OF_TOKEN).digest('hex'),
                            _SECRET_CONTENT_OF_FILE_EXTENDED_PATH_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_SECRET_CONTENT_OF_TOKEN).digest('hex').slice(0, 7),
                            _FILE_EXTENSION_MIMETYPE = _THREAD.personal.profile.match(/data:image\/\w+/ig)[0].replace(/data:image\//ig, '');

                      _Functions._removeFileWithEmptyDirectory(existingDoc.personal.profile);

                      _TARGET["personal.profile"] = _Functions._uploadUserProfilePhoto(_PROFILE_DIRECTORY, `${_SECRET_CONTENT_OF_FILE_EXTENDED_PATH_WITH_APPENDED_KEY}/${_SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY}.${_FILE_EXTENSION_MIMETYPE}`);
                    }
                  })
                }

                if (_IS__LOCAL_COLLECTION_READY_TO_UPDATE){
                  _COLLECTION.updateOne(_CRITERIA, _THREAD, function(updateQueryError, doc){
                    if (updateQueryError != null){
                      const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection update request could\'t be processed.`, 700);

                      res.json(RECURSIVE_CONTENT);
                    }else{
                      const RECURSIVE_CONTENT = _Functions._throwResponseWithData(doc);

                      res.json(RECURSIVE_CONTENT);

                      client.close();
                    }
                  });
                }
                break;

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

                      const _TARGET = {
                              "$set": {
                                "phone.mobile.validation.value": true,
                                "phone.mobile.validation.modified_at": _TODAY
                              }
                            };

                      _COLLECTION = _DB.collection('users');

                      _CRITERIA = {
                        _id: _THREAD.user_id
                      }

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

                    const _VALIDATION_TOKEN = Math.floor(Math.random() * ((999999 - 100000) + 1) + 100000).toString();

                    _COLLECTION = _DB.collection('users');

                    _CRITERIA = {
                      _id: _THREAD.user_id
                    }

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
        case 'usergroups':
          if (typeof _THREAD.reference_id != 'undefined'){
            _THREAD.reference_id = new ObjectID(_THREAD.reference_id);
          }

          if (typeof _THREAD.type != 'undefined'){
            _THREAD.type = _Functions._convertTokenToKeyword(_THREAD.type);
          }

          if (typeof _THREAD.role != 'undefined'){
            _THREAD.role = _Functions._convertTokenToKeyword(_THREAD.role);
          }

          _IS_COLLECTION_READY_TO_UPDATE = true;
          break;
        case 'endusers':
          _CRITERIA = {
            _id: new ObjectID(_TOKEN)
          };

          var _TARGET = {
            "$set": {
              modified_at: _TODAY
            }
          };

          if (typeof _THREAD.brand != 'undefined'){
            if (typeof _THREAD.brand.name != 'undefined'){
              _TARGET["$set"]["brand.name"] = _THREAD.brand.name;
            }

            if (typeof _THREAD.brand.photo != 'undefined'){
              var _IS_REMOVED_THE_RECENT_HOSTED_FILE = true;

              const _CHECK_REQUEST_CRITERIA = [
                {
                  "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user"
                  }
                },
                {
                  "$unwind": {
                    "path": "$user",
                    "preserveNullAndEmptyArrays": true
                  }
                },
                {
                  "$lookup": {
                    "from": "usergroups",
                    "localField": "user_group_id",
                    "foreignField": "_id",
                    "as": "usergroup"
                  }
                },
                {
                  "$unwind": "$usergroup"
                },
                {
                  "$project": {
                    "user_id": 0,
                    "user_group_id": 0
                  }
                },
                {
                  "$match": {
                    "_id": _TOKEN
                  }
                },
                {
                  "$limit": 1
                }
              ];

              _COLLECTION.aggregate(_CHECK_REQUEST_CRITERIA)
              .toArray(function(userAuthQueryError, doc){
                if (userAuthQueryError != null){
                  const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The check request on ${_COLLECTION_NAME} collection could\'t be processed.`, 700);

                  _IS_REMOVED_THE_RECENT_HOSTED_FILE = false;

                  res.json(RECURSIVE_CONTENT);
                }else{
                  const _CHECKED_ENDUSER = doc[0];

                  if (typeof _CHECKED_ENDUSER.brand.photo != 'undefined'){
                    const _IS_REMOVE_REQUEST_DONE = _Functions._removeFileWithPath(_CHECKED_ENDUSER.brand.photo);

                    if (_IS_REMOVE_REQUEST_DONE !== false){
                      const _SECRET_CONTENT_OF_FILE_NAME = `${_TODAY.getTime()}${Math.random()}${_CHECKED_ENDUSER.password}`,
                            _SECRET_CONTENT_OF_FILE_EXTENDED_PATH = `${_TODAY.getTime()}${_CHECKED_ENDUSER.password}`,
                            _SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_SECRET_CONTENT_OF_TOKEN).digest('hex'),
                            _FILE_EXTENSION_MIMETYPE = _THREAD.brand.photo.match(/data:image\/\w+/ig)[0].replace(/data:image\//ig, `${_SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY}.${_FILE_EXTENSION_MIMETYPE}`);

                      _TARGET["$set"]["brand.photo"] = _Functions._uploadBrandProfilePhoto(_THREAD.brand.photo, `${_SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY}.${_FILE_EXTENSION_MIMETYPE}`);
                    }
                  }
                }
              });
          }

          if (_THREAD.user_group_id){
            _TARGET.user_group_id = new ObjectID(_THREAD.user_group_id);
          }

          if (((typeof _THREAD.brand.photo != 'undefined') && _IS_REMOVED_THE_RECENT_HOSTED_FILE) || (typeof _THREAD.brand.photo == 'undefined')){
              _COLLECTION.updateOne(_CRITERIA, _TARGET, function(updateQueryError, doc){
                if (updateQueryError != null){
                  const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection update request could\'t be processed.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  const RECURSIVE_CONTENT = _Functions._throwResponseWithData(doc);

                  res.json(RECURSIVE_CONTENT);

                  client.close();
                }
              });
            }
          }
          break;

          default:
            const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('The name of your desired token has not been defined.');

            res.json(RECURSIVE_CONTENT);
          }

          if (_IS_COLLECTION_READY_TO_UPDATE){
            _THREAD.modified_at = _TODAY;

            const _TARGET = {
                    "$set": _THREAD
                  };

            _CRITERIA = {
              _id: new ObjectID(_TOKEN)
            }

            _COLLECTION.updateOne(_CRITERIA, _TARGET, function(updateQueryError, doc){
              if (updateQueryError != null){
                const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection update request could\'t be processed.`, 700);

                res.json(RECURSIVE_CONTENT);
              }else{
                const RECURSIVE_CONTENT = _Functions._throwResponseWithData(doc);

                res.json(RECURSIVE_CONTENT);

                client.close();
              }
            });
          }

          }
        });
    }
  });
};
