var crypto = require('crypto'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    ObjectID = require('mongodb').ObjectID;

const Modules = require('../../src/modules');

const _LOCAL_FUNCTIONS = {
  _throwNewInstanceError: (collectionName) => {
    const _COLLECTION_NAME_AS_SINGLE = (collectionName.match(/\w+s$/ig) != null)? collectionName.slice(0, -1): collectionName,
          RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`You\'ve not entered the required information to create a new ${_COLLECTION_NAME_AS_SINGLE}.`);

    return RECURSIVE_CONTENT;
  },
  _throwConnectionError: () => {
    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The Interfas collection could not be reached.`, 700);

    return RECURSIVE_CONTENT;
  }
};

module.exports = (app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY) => {
  app.put(`${Modules.Functions._getEndpointOfAPI()}/:collection/:token`, (req, res) => {
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
                var _TARGET = {
                      "$set": {
                        modified_at: _TODAY
                      }
                    },
                    _IS__LOCAL_COLLECTION_READY_TO_UPDATE = true;

                if (typeof _THREAD.password != 'undefined'){
                  const _SECRET_CONTENT_OF_PASSWORD = crypto.createCipher('aes192', _THREAD.password),
                        _SECRET_CONTENT_OF_PASSWORD_WITH_APPENDED_KEY = `${_SECRET_CONTENT_OF_PASSWORD.update(INTERFAS_KEY, 'utf8', 'hex')}${_SECRET_CONTENT_OF_PASSWORD.final('hex')}`;

                  _TARGET["$set"]["password"] = _SECRET_CONTENT_OF_PASSWORD_WITH_APPENDED_KEY;
                }

                if (typeof _THREAD.personal != 'undefined'){
                  if ((typeof _THREAD.personal.first_name != 'undefined') && (typeof _THREAD.personal.last_name != 'undefined')){
                    _TARGET["$set"]["personal.first_name"] =Modules.Functions._convertKeywordToToken(_THREAD.personal.first_name);
                    _TARGET["$set"]["personal.last_name"] = Modules.Functions._convertKeywordToToken(_THREAD.personal.last_name);
                  }
                }

                if ((typeof _THREAD.first_name != 'undefined') || (typeof _THREAD.firstName != 'undefined')){
                  const _FIRST_NAME = _THREAD.first_name || _THREAD.firstName;

                  _TARGET["$set"]["personal.first_name"] =Modules.Functions._convertKeywordToToken(_FIRST_NAME);
                }

                if ((typeof _THREAD.last_name != 'undefined') || (typeof _THREAD.lastName != 'undefined')){
                  const _LAST_NAME = _THREAD.last_name || _THREAD.lastName;

                  _TARGET["$set"]["personal.last_name"] = Modules.Functions._convertKeywordToToken(_LAST_NAME);
                }

                if (typeof _THREAD.email != 'undefined'){
                  const _SECRET_CONTENT_OF_TOKEN = `${_TODAY.getTime()}${Math.random()}${_THREAD.email}${_THREAD.password}`,
                        _SECRET_CONTENT_OF_TOKEN_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_SECRET_CONTENT_OF_TOKEN).digest('hex');

                  _TARGET["$set"]["email"] = {
                    content: _THREAD.email,
                    validation: {
                      token: _SECRET_CONTENT_OF_TOKEN_WITH_APPENDED_KEY,
                      value: false
                    }
                  };

                  if (typeof _THREAD.target != 'undefined'){
                    if ((typeof _THREAD.target.app_name != 'undefined') && (typeof _THREAD.target.brand != 'undefined')){
                      Modules.Functions._sendInvitation(_THREAD.target.app_name, {
                        ..._THREAD.target.brand,
                        target: {
                          email: _THREAD.email,
                          token: _SECRET_CONTENT_OF_TOKEN_WITH_APPENDED_KEY
                        }
                      })
                      .then((response) => {
                        // handle sent message details
                      })
                      .catch((error) => {
                        // throw error
                      })
                    }
                  }
                }

                if (typeof _THREAD.phone != 'undefined') {
                  if (typeof _THREAD.phone.mobile != 'undefined'){
                    _TARGET["$set"]["phone.mobile"] = {
                      content: _THREAD.phone.mobile,
                      validation: {
                        token: Math.floor(Math.random() * ((999999 - 100000) + 1) + 100000).toString(),
                        value: false,
                        created_at: _TODAY,
                        modified_at: _TODAY
                      }
                    };

                    Modules.Functions._sendMessage(_TARGET["$set"]["phone.mobile"].content, _TARGET["$set"]["phone.mobile"].validation.token)
                    .then((response) => {
                      //YOU CAN STORE YOUR RESPONSE IN DB
                    })
                    .catch((error) => {
                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(error.message, error.status);

                      res.json(RECURSIVE_CONTENT);
                    })
                  }
                }

                _CRITERIA = {
                  _id: new ObjectID(_TOKEN)
                };

                if ((typeof _THREAD.personal.profile != 'undefined') || (typeof _THREAD.profile != 'undefined') || (typeof _THREAD.profile_photo != 'undefined') || (typeof _THREAD.profilePhoto != 'undefined')){
                  const _PROFILE_DIRECTORY = _THREAD.personal.profile || _THREAD.profile || _THREAD.profile_photo || _THREAD.profilePhoto;

                  _COLLECTION.findOne(_CRITERIA, function(existingCheckQueryError, existingDoc){
                    if (existingCheckQueryError != null){
                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(existingCheckQueryError, 700);

                      res.json(RECURSIVE_CONTENT);

                      _IS__LOCAL_COLLECTION_READY_TO_UPDATE = false;
                    }else{
                      const _SECRET_CONTENT_OF_FILE_NAME = `${_TODAY.getTime()}${Math.random()}${_TARGET.password}`,
                            _SECRET_CONTENT_OF_FILE_EXTENDED_PATH = `${_TODAY.getTime()}${_TARGET.password}`,
                            _SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_SECRET_CONTENT_OF_TOKEN).digest('hex'),
                            _SECRET_CONTENT_OF_FILE_EXTENDED_PATH_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_SECRET_CONTENT_OF_TOKEN).digest('hex').slice(0, 7),
                            _FILE_EXTENSION_MIMETYPE = _THREAD.personal.profile.match(/data:image\/\w+/ig)[0].replace(/data:image\//ig, '');

                      Modules.Functions._removeFileWithEmptyDirectory(existingDoc.personal.profile);

                      _TARGET["$set"]["personal.profile"] = Modules.Functions._uploadUserProfilePhoto(_PROFILE_DIRECTORY, `${_SECRET_CONTENT_OF_FILE_EXTENDED_PATH_WITH_APPENDED_KEY}/${_SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY}.${_FILE_EXTENSION_MIMETYPE}`);
                    }
                  })
                }

                if (_IS__LOCAL_COLLECTION_READY_TO_UPDATE){
                  _COLLECTION.updateOne(_CRITERIA, _THREAD, function(updateQueryError, doc){
                    if (updateQueryError != null){
                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection update request could\'t be processed.`, 700);

                      res.json(RECURSIVE_CONTENT);
                    }else{
                      const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc);

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
                          const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The 'users' collection update request could\'t be processed.`, 700);

                          res.json(RECURSIVE_CONTENT);
                        }else{
                          const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc);

                          res.json(RECURSIVE_CONTENT);

                          client.close();
                        }
                      });
                    }else{
                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('You\'ve not entered the required information to verify number', 700);

                      res.json(RECURSIVE_CONTENT);
                    }
                    break;

                  case 'email-address':
                  case 'email':
                  case 'mail-address':
                  case 'mail':
                    if ((typeof _THREAD.token != 'undefined') || (typeof _THREAD.email_token != 'undefined')){
                      const _EMAIL_TOKEN = _THREAD.token || _THREAD.email_token;

                      const _TARGET = {
                              "$set": {
                                "email.validation.value": true,
                                "phone.mobile.validation.modified_at": _TODAY
                              }
                            };

                      _COLLECTION = _DB.collection('users');

                      _CRITERIA = {
                        "email.validation.token": _EMAIL_TOKEN
                      }

                      _COLLECTION.findOne(_CRITERIA, function(userFindQueryError, doc){
                        if (userFindQueryError != null){
                          const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The 'users' collection find request could\'t be processed.`, 700);

                          res.json(RECURSIVE_CONTENT);
                        }else{
                          const _USER = doc;

                          var _DID_A_CONFLICT_OCCURED_ON_EMAIL_SUBSET = false;

                          if (typeof _USER.email.validation.value != 'undefined'){
                            if (typeof _USER.email.validation != 'undefined'){
                              if (typeof _USER.email.validation.value != 'undefined'){
                                if (_USER.email.validation.value === false){
                                  _COLLECTION.updateOne(_CRITERIA, _TARGET, function(verifyQueryError, doc){
                                    if (verifyQueryError != null){
                                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The 'users' collection update request could\'t be processed.`, 700);

                                      res.json(RECURSIVE_CONTENT);
                                    }else{
                                      const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc);

                                      res.json(RECURSIVE_CONTENT);

                                      client.close();
                                    }
                                  });
                                }else{
                                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('You have been verified account before.', 700);

                                  res.json(RECURSIVE_CONTENT);
                                }
                              }else{
                                _DID_A_CONFLICT_OCCURED_ON_EMAIL_SUBSET = true;
                              }
                            }else{
                              _DID_A_CONFLICT_OCCURED_ON_EMAIL_SUBSET = true;
                            }
                          }else{
                            _DID_A_CONFLICT_OCCURED_ON_EMAIL_SUBSET = true;
                          }

                          if (_DID_A_CONFLICT_OCCURED_ON_EMAIL_SUBSET){
                            const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('A conflict occurred on fetching email subset.', 700);

                            res.json(RECURSIVE_CONTENT);
                          }
                        }
                      });
                    }else{
                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('You\'ve not entered the required information to verify email', 700);

                      res.json(RECURSIVE_CONTENT);
                    }
                    break;

                  default:
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

                    res.json(RECURSIVE_CONTENT);
                    break;
                }
                break;

              case 'usergroups':
                if (typeof _THREAD.reference_id != 'undefined'){
                  _THREAD.reference_id = new ObjectID(_THREAD.reference_id);
                }

                if (typeof _THREAD.type != 'undefined'){
                  _THREAD.type = Modules.Functions._convertTokenToKeyword(_THREAD.type);
                }

                if (typeof _THREAD.role != 'undefined'){
                  _THREAD.role = Modules.Functions._convertTokenToKeyword(_THREAD.role);
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
                        const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The check request on ${_COLLECTION_NAME} collection could\'t be processed.`, 700);

                        _IS_REMOVED_THE_RECENT_HOSTED_FILE = false;

                        res.json(RECURSIVE_CONTENT);
                      }else{
                        const _CHECKED_ENDUSER = doc[0];

                        if (typeof _CHECKED_ENDUSER.brand.photo != 'undefined'){
                          const _IS_REMOVE_REQUEST_DONE = Modules.Functions._removeFileWithPath(_CHECKED_ENDUSER.brand.photo);

                          if (_IS_REMOVE_REQUEST_DONE !== false){
                            const _SECRET_CONTENT_OF_FILE_NAME = `${_TODAY.getTime()}${Math.random()}${_CHECKED_ENDUSER.password}`,
                                  _SECRET_CONTENT_OF_FILE_EXTENDED_PATH = `${_TODAY.getTime()}${_CHECKED_ENDUSER.password}`,
                                  _SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_SECRET_CONTENT_OF_TOKEN).digest('hex'),
                                  _FILE_EXTENSION_MIMETYPE = _THREAD.brand.photo.match(/data:image\/\w+/ig)[0].replace(/data:image\//ig, `${_SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY}.${_FILE_EXTENSION_MIMETYPE}`);

                            _TARGET["$set"]["brand.photo"] = Modules.Functions._uploadBrandProfilePhoto(_THREAD.brand.photo, `${_SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY}.${_FILE_EXTENSION_MIMETYPE}`);
                          }
                        }
                      }
                    });
                }

                if (_THREAD.user_group_id){
                  _TARGET["$set"]["user_group_id"] = new ObjectID(_THREAD.user_group_id);
                }

                if (typeof _THREAD.reference_id != 'undefined'){
                  _TARGET["$set"]["reference_id"] = new ObjectID(_THREAD.reference_id);
                }

                if (typeof _THREAD.cardinal_id != 'undefined'){
                  _TARGET["$set"]["cardinal_id"] = new ObjectID(_THREAD.cardinal_id);
                }

                if ((typeof _THREAD.cardinal_ancestors != 'undefined') && Array.isArray(_THREAD.cardinal_ancestors)){
                  _TARGET["$set"]["cardinal_ancestors"] = _THREAD.cardinal_ancestors.map((ancestor, i) => {
                    const _FINAL_ANCESTOR = new ObjectID(ancestor);

                    return _FINAL_ANCESTOR;
                  });
                }

                if (((typeof _THREAD.brand.photo != 'undefined') && _IS_REMOVED_THE_RECENT_HOSTED_FILE) || (typeof _THREAD.brand.photo == 'undefined')){
                    _COLLECTION.updateOne(_CRITERIA, _TARGET, function(updateQueryError, doc){
                      if (updateQueryError != null){
                        const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection update request could\'t be processed.`, 700);

                        res.json(RECURSIVE_CONTENT);
                      }else{
                        const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc);

                        res.json(RECURSIVE_CONTENT);

                        client.close();
                      }
                    });
                  }
                }
                break;

              case 'wallets':
                if (typeof _THREAD.currency_id != 'undefined'){
                  _THREAD.currency_id = new ObjectID(_THREAD.currency_id);
                }

                if (typeof _THREAD.end_user_id != 'undefined'){
                  _THREAD.end_user_id = new ObjectID(_THREAD.end_user_id);
                }

                if ((typeof _THREAD.balance != 'undefined') && (!isNaN(_THREAD.balance))){
                  _THREAD.balance = parseInt(_THREAD.balance);
                }

                _IS_COLLECTION_READY_TO_UPDATE = true;
                break;

              case 'products':
                let _TARGET_URI = _TOKEN;

                if (typeof _THREAD.category_id != 'undefined'){
                  _TARGET_URI = _THREAD.category_id = new ObjectID(_THREAD.category_id);
                }

                if (typeof _THREAD.features != 'undefined'){
                  _THREAD.features = _THREAD.features.map((item, i) => {
                    let _FINAL_ITEM = item;

                    _FINAL_ITEM.feature_id = new ObjectID(_FINAL_ITEM.feature_id);

                    if (typeof _FINAL_ITEM.unit_id != 'undefined'){
                      _FINAL_ITEM.unit_id = new ObjectID(_FINAL_ITEM.unit_id);
                    }

                    return _FINAL_ITEM;
                  });
                }

                if (typeof _THREAD.inventory_units != 'undefined'){
                  _THREAD.inventory_units = _THREAD.inventory_units.map((item, i) => {
                    let _FINAL_ITEM = new ObjectID(item);

                    return _FINAL_ITEM;
                  });
                }

                if (typeof _THREAD.photos != 'undefined'){
                  _THREAD.photos = _THREAD.photos.map((item, i) => {
                    let _FINAL_ITEM = item;

                    if (_FINAL_ITEM.content.match(/\.*base64\.*/gi)){
                      const _SECRET_CONTENT_OF_FILE_NAME = `${_TODAY.getTime()}${Math.random()}`,
                            _SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_TARGET_URI).digest('hex'),
                            _FILE_EXTENSION_MIMETYPE = _FINAL_ITEM.content.match(/data:image\/\w+/ig)[0].replace(/data:image\//ig, '');

                      _FINAL_ITEM.content = `http://${req.headers.host}/${Modules.Functions._uploadProductPhoto(_FINAL_ITEM.content, `${_TARGET_URI}/${_SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY}.${_FILE_EXTENSION_MIMETYPE}`)}`;
                    }

                    return _FINAL_ITEM;
                  });
                }

                _IS_COLLECTION_READY_TO_UPDATE = true;
                break;

              case 'taxonomies':
                if (typeof _THREAD.key != 'undefined'){
                  _THREAD.key = Modules.Functions._convertTokenToKeyword(_THREAD.key);
                }

                if (typeof _THREAD.value != 'undefined'){
                  const _OPTIONS = req.query,
                        _CONTENT_PROCESS_OPTION = _OPTIONS.process_content || _OPTIONS.processContent || _OPTIONS.pc || _OPTIONS.PC,
                        _HAS_CONTENT_PROCESS_OPTION = (typeof _CONTENT_PROCESS_OPTION == 'undefined')? true: (((_CONTENT_PROCESS_OPTION.toLowerCase() == 'false') || (_CONTENT_PROCESS_OPTION == '0'))? false: true);

                  if (_HAS_CONTENT_PROCESS_OPTION){
                    _THREAD.value = Modules.Functions._convertTokenToKeyword(_THREAD.value);
                  }
                }

                if (typeof _THREAD.ancestors != 'undefined'){
                  _THREAD.ancestors = _THREAD.ancestors.map((ancestor, i) => {
                    const _FINAL_ANCESTOR = new ObjectID(ancestor);

                    return _FINAL_ANCESTOR;
                  });
                }

                _IS_COLLECTION_READY_TO_UPDATE = true;
                break;

              case 'fragments':
                if (typeof _THREAD.end_user_id != 'undefined'){
                  _THREAD.end_user_id = new ObjectID(_THREAD.end_user_id);
                }

                if (typeof _THREAD.cardinal_id != 'undefined'){
                  _THREAD.cardinal_id = new ObjectID(_THREAD.cardinal_id);
                }

                if (typeof _THREAD.product_id != 'undefined'){
                  _THREAD.product_id = new ObjectID(_THREAD.product_id);
                }

                if (typeof _THREAD.features != 'undefined'){
                  _THREAD.features = _THREAD.features.map((item, i) => {
                    let _FINAL_ITEM = item;

                    _FINAL_ITEM.feature_id = new ObjectID(_FINAL_ITEM.feature_id);

                    if (typeof _FINAL_ITEM.unit_id != 'undefined'){
                      _FINAL_ITEM.unit_id = new ObjectID(_FINAL_ITEM.unit_id);
                    }

                    if (typeof _FINAL_ITEM.warehouse != 'undefined'){
                      if (typeof _FINAL_ITEM.warehouse._id != 'undefined'){
                        _FINAL_ITEM.warehouse._id = new ObjectID(_FINAL_ITEM.warehouse._id);
                      }
                    }

                    return _FINAL_ITEM;
                  });
                }

                if (typeof _THREAD.prices != 'undefined'){
                  _THREAD.prices = _THREAD.prices.map((item, i) => {
                    let _FINAL_ITEM = item;

                    _FINAL_ITEM.feature_reference_id = new ObjectID(_FINAL_ITEM.feature_reference_id);

                    return _FINAL_ITEM;
                  });
                }

                if (typeof _THREAD.shipping_plans != 'undefined'){
                  _THREAD.shipping_plans = _THREAD.shipping_plans.map((item, i) => {
                    let _FINAL_ITEM = item;

                    _FINAL_ITEM.feature_reference_id = new ObjectID(_FINAL_ITEM.feature_reference_id);
                    _FINAL_ITEM.shipping_method_id = new ObjectID(_FINAL_ITEM.shipping_method_id);

                    return _FINAL_ITEM;
                  });
                }
                break;

              default:
                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('The name of your desired token has not been defined.');

                res.json(RECURSIVE_CONTENT);
                break;
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
                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection update request could\'t be processed.`, 700);

                res.json(RECURSIVE_CONTENT);
              }else{
                const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc);

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
