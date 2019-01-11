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
  app.post('/:collection', (req, res) => {
    if (typeof req.params.collection != 'undefined'){
      const _COLLECTION_NAME = req.params.collection.toLowerCase(),
            _TODAY = new Date();

      var _THREAD = req.body,
          _IS_COLLECTION_READY_TO_ABSORB = false;

      MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
        if (connectionError != null){
            const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection could not be reached.`, 700);

            res.json(RECURSIVE_CONTENT);

            client.close();
          }else{
            switch (_COLLECTION_NAME) {
              case 'users':
                if ((typeof _THREAD.personal != 'undefined') && (typeof _THREAD.user_group_id != 'undefined') && (typeof _THREAD.password != 'undefined') && ((typeof _THREAD.email != 'undefined') || (typeof _THREAD.phone != 'undefined'))){
                  const _SECRET_CONTENT_OF_PASSWORD = crypto.createCipher('aes192', _THREAD.password),
                        _SECRET_CONTENT_OF_PASSWORD_WITH_APPENDED_KEY = `${_SECRET_CONTENT_OF_PASSWORD.update(INTERFAS_KEY, 'utf8', 'hex')}${_SECRET_CONTENT_OF_PASSWORD.final('hex')}`;

                  _THREAD.password = _SECRET_CONTENT_OF_PASSWORD_WITH_APPENDED_KEY;

                  if (typeof _THREAD.personal.profile != 'undefined'){
                    const _SECRET_CONTENT_OF_FILE_NAME = `${_TODAY.getTime()}${Math.random()}${_THREAD.password}`,
                          _SECRET_CONTENT_OF_FILE_EXTENDED_PATH = `${_TODAY.getTime()}${_THREAD.password}`,
                          _SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_SECRET_CONTENT_OF_TOKEN).digest('hex'),
                          _FILE_EXTENSION_MIMETYPE = _THREAD.personal.profile.match(/data:image\/\w+/ig)[0].replace(/data:image\//ig, '');

                    _THREAD.personal.profile = _Functions._uploadUserProfilePhoto(_THREAD.personal.profile, `${_SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY}.${_FILE_EXTENSION_MIMETYPE}`);
                  }

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
                          value: false,
                          created_at: _TODAY,
                          modified_at: _TODAY
                        }
                      };

                      _Functions._sendMessage(_THREAD.phone.mobile.content, _THREAD.phone.mobile.validation.token)
                      .then((response) => {
                        //YOU CAN STORE YOUR RESPONSE IN DB
                      })
                      .catch((error) => {
                        const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(error.message, error.status);

                        res.json(RECURSIVE_CONTENT);
                      })
                    }
                  }

                  _THREAD.user_group_id = new ObjectID(_THREAD.user_group_id);
                  _THREAD.modified_at = _THREAD.created_at = _TODAY;

                  const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                        _COLLECTION = _DB.collection(_COLLECTION_NAME),
                        _DEPENDED_COLLECTION = _DB.collection('endusers');

                  var _CHECKING_CRITERIA = {
                    "$or": []
                  };

                  if (typeof _THREAD.phone.mobile.content != 'undefined'){
                    _CHECKING_CRITERIA["$or"].push({
                      "email.content": _THREAD.phone.mobile.content
                    })
                  }

                  if (typeof _THREAD.email.content != 'undefined'){
                    _CHECKING_CRITERIA["$or"].push({
                      "phone.mobile.content": _THREAD.email.content
                    })
                  }

                  _COLLECTION.findOne(_CHECKING_CRITERIA, function(existingCheckQueryError, existingDoc){
                    if (existingCheckQueryError != null){
                      const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(existingCheckQueryError, 700);

                      res.json(RECURSIVE_CONTENT);
                    }else{
                      if (existingDoc != null){
                        const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('The selected email or phone number is not available.', 700);

                        res.json(RECURSIVE_CONTENT);
                      }else{
                        const _END_USER_SEED = {
                          user_group_id: _THREAD.user_group_id
                        };

                        delete _THREAD.user_group_id;

                        _COLLECTION.insertOne(_THREAD, function(insertUserQueryError, userDoc){
                          if (insertUserQueryError != null){
                            const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection insert request could\'t be processed.`, 700);

                            res.json(RECURSIVE_CONTENT);
                          }else{
                            if (userDoc.insertedCount != 1){
                              const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The document in ${_COLLECTION_NAME} collection could\'t be inserted.`, 700);

                              res.json(RECURSIVE_CONTENT);
                            }else{
                              _DEPENDED_COLLECTION.insertOne(_END_USER_SEED, function(insertEndUserQueryError, endUserDoc){
                                if (insertEndUserQueryError != null){
                                  const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The End User collection insert request could\'t be processed.`, 700);

                                  res.json(RECURSIVE_CONTENT);
                                }else{
                                  if (endUserDoc.insertedCount != 1){
                                    const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The document in End User collection could\'t be inserted.`, 700);

                                    res.json(RECURSIVE_CONTENT);
                                  }else{
                                    const RECURSIVE_CONTENT = {
                                      user: userDoc.ops[0],
                                      endUser: endUserDoc.ops[0]
                                    };

                                    res.redirect(`/endusers/${RECURSIVE_CONTENT.endUser._id}`);
                                  }
                                }
                              })
                            }
                          }
                        });
                      }
                    }

                    client.close();
                  });
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'endusers':
                if ((typeof _THREAD.user_id != 'undefined')){
                  _THREAD.viewed = 0;
                  _THREAD.user_id = new ObjectID(_THREAD.user_id);
                  _THREAD.user_group_id = new ObjectID(_THREAD.user_group_id);

                  //End User detection for user groups

                  _IS_COLLECTION_READY_TO_ABSORB = true;
                }else if ((typeof _THREAD.user_groups_depended_count != 'undefined') || (typeof _THREAD.user_groups_count != 'undefined') || (typeof _THREAD.user_roles_depended_count != 'undefined') || (typeof _THREAD.user_roles_count != 'undefined') || (typeof _THREAD.roles_depended_count != 'undefined') || (typeof _THREAD.roles_count != 'undefined')){
                  const _ROLES_COUNT_IN_STRING_MODE = _THREAD.user_groups_depended_count || _THREAD.user_groups_count || _THREAD.user_roles_depended_count || _THREAD.user_roles_count || _THREAD.roles_depended_count || _THREAD.roles_count;

                  if ((typeof _ROLES_COUNT_IN_STRING_MODE != 'undefined') && Number.isInteger(_ROLES_COUNT_IN_STRING_MODE)){
                    const _ROLES_COUNT = parseInt(_ROLES_COUNT_IN_STRING_MODE);

                    var _ENDUSERS = [];

                    for (var i = 0; i < _ROLES_COUNT; i++) {
                      const _SINGLE_ENDUSER = {
                        user_group_id: new ObjectID(_THREAD.user_group_id),
                        modified_at: _TODAY,
                        created_at: _TODAY
                      };

                      if (typeof _THREAD.reference_id != 'undefined'){
                        _SINGLE_ENDUSER.reference_id = new ObjectID(_THREAD.reference_id);
                      }

                      _ENDUSERS.push(_SINGLE_ENDUSER);
                    }

                    const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                          _COLLECTION = _DB.collection(_COLLECTION_NAME);

                    _COLLECTION.insertMany(_ENDUSERS, function(insertsQueryError, docs){
                      if (insertsQueryError != null){
                        const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection inserts request could\'t be processed.`, 700);

                        res.json(RECURSIVE_CONTENT);
                      }else{
                        if (docs.insertedCount === 0){
                          const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The documents in ${_COLLECTION_NAME} collection could\'t be inserted.`, 700);

                          res.json(RECURSIVE_CONTENT);
                        }else{
                          const RECURSIVE_CONTENT = _Functions._throwResponseWithData(docs.ops);

                          res.json(RECURSIVE_CONTENT);

                          client.close();
                        }
                      }
                    });
                  }else{
                    const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`You should define user groups (Roles) count.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'usergroups':
                if ((typeof _THREAD.type != 'undefined') && (typeof _THREAD.role != 'undefined')){
                  _THREAD.type = _Functions._convertTokenToKeyword(_THREAD.type);

                  if (typeof _THREAD.role != 'undefined'){
                    _THREAD.role = _Functions._convertTokenToKeyword(_THREAD.role);
                  }

                  _IS_COLLECTION_READY_TO_ABSORB = true;
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'wallets':
                if ((typeof _THREAD.end_user_id != 'undefined') && (typeof _THREAD.currency != 'undefined') && (typeof _THREAD.name != 'undefined')){
                  _THREAD.end_user_id = new ObjectID(_THREAD.end_user_id);
                  _THREAD.currency = _Functions._convertTokenToKeyword(_THREAD.currency);
                  _THREAD.balance = 0;

                  _IS_COLLECTION_READY_TO_ABSORB = true;
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'messages':
                if ((typeof _THREAD.receiver_id != 'undefined') && (typeof _THREAD.message != 'undefined')){
                  _THREAD.receiver_id = new ObjectID(_THREAD.receiver_id);

                  if (typeof _THREAD.message.type != 'undefined'){
                    _THREAD.message.type = _Functions._convertTokenToKeyword(_THREAD.message.type);
                  }

                  if (typeof _THREAD.message.status != 'undefined'){
                    _THREAD.message.status = _Functions._convertTokenToKeyword(_THREAD.message.status);
                  }

                  _IS_COLLECTION_READY_TO_ABSORB = true;
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'warehouses':
                if ((typeof _THREAD.user_id != 'undefined') && (typeof _THREAD.name != 'undefined')){
                  _THREAD.user_id = new ObjectID(_THREAD.user_id);

                  _IS_COLLECTION_READY_TO_ABSORB = true;
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'turnovers':
                if ((typeof _THREAD.warehouse_id != 'undefined') && (typeof _THREAD.product_id != 'undefined') && (typeof _THREAD.beginning_inventory != 'undefined') && ((typeof _THREAD.purchase != 'undefined') || (typeof _THREAD.sold != 'undefined')) && (typeof _THREAD.ending_inventory != 'undefined')){
                  _THREAD.warehouse_id = new ObjectID(_THREAD.warehouse_id);
                  _THREAD.product_id = new ObjectID(_THREAD.product_id);

                  _IS_COLLECTION_READY_TO_ABSORB = true;
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'orders':
                if ((typeof _THREAD.end_user_id != 'undefined') && (typeof _THREAD.items != 'undefined') && (typeof _THREAD.taxes != 'undefined') && (typeof _THREAD.discounts != 'undefined') && (typeof _THREAD.status != 'undefined') && (typeof _THREAD.shipping != 'undefined') && (typeof _THREAD.total_amount != 'undefined')) {
                  _THREAD.end_user_id = new ObjectID(_THREAD.end_user_id);

                  if (Array.isArray(_THREAD.items)){
                    _THREAD.items = _THREAD.items.map((item, i) => {
                      if (typeof item.product_id != 'undefined'){
                        item.product_id = new ObjectID(item.product_id)
                      }

                      return item;
                    });
                  }

                  _THREAD.status = _Functions._convertTokenToKeyword(_THREAD.status);
                  _THREAD.shipping = _Functions._convertTokenToKeyword(_THREAD.shipping);

                  _IS_COLLECTION_READY_TO_ABSORB = true;
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'currencies':
                if (((typeof _THREAD.type != 'undefined') || (typeof _THREAD.name != 'undefined') || (typeof _THREAD.currency_type != 'undefined') || (typeof _THREAD.currency_name != 'undefined')) && ((typeof _THREAD.sign != 'undefined') || (typeof _THREAD.currency_sign != 'undefined'))){
                  const _CURRENCY_TYPE = _THREAD.type || _THREAD.name || _THREAD.currency_type || _THREAD.currency_name,
                        _CURRENCY_SIGN = _THREAD.sign || _THREAD.currency_sign;

                  if (_CURRENCY_TYPE != '' && _CURRENCY_SIGN != ''){
                    _THREAD.type = _Functions._convertTokenToKeyword(_CURRENCY_TYPE);
                    _THREAD.sign = _CURRENCY_SIGN;

                    _IS_COLLECTION_READY_TO_ABSORB = true;
                  }
                }
                break;

              case 'auth':
                if (((typeof _THREAD.user_name != 'undefined') || (typeof _THREAD.userName != 'undefined') || (typeof _THREAD.email != 'undefined') || (typeof _THREAD.token != 'undefined') || (typeof _THREAD.phoneNumber != 'undefined') || (typeof _THREAD.phone_number != 'undefined')) && (typeof _THREAD.password != 'undefined')){
                  const _TOKEN = _THREAD.user_name || _THREAD.userName || _THREAD.email || _THREAD.token || _THREAD.phone_number || _THREAD.phoneNumber,
                        _SECRET_CONTENT_OF_PASSWORD = crypto.createCipher('aes192', _THREAD.password),
                        _SECRET_CONTENT_OF_PASSWORD_WITH_APPENDED_KEY = `${_SECRET_CONTENT_OF_PASSWORD.update(INTERFAS_KEY, 'utf8', 'hex')}${_SECRET_CONTENT_OF_PASSWORD.final('hex')}`;

                  const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                        _COLLECTION = _DB.collection('endusers');

                  const _CRITERIA = [
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
                        "$and": [
                          {
                            "$or": [
                              {
                                "user.email.content": _TOKEN
                              },
                              {
                                "user.phone.mobile.content": _TOKEN
                              }
                            ]
                          },
                          {
                            "user.password": _SECRET_CONTENT_OF_PASSWORD_WITH_APPENDED_KEY
                          }
                        ]
                      }
                    },
                    {
                      "$limit": 1
                    }
                  ];

                  _COLLECTION.aggregate(_CRITERIA)
                  .toArray(function(userAuthQueryError, doc){
                    if (userAuthQueryError != null){
                      const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The authentication request could\'t be processed.`, 700);

                      res.json(RECURSIVE_CONTENT);
                    }else{
                      const RECURSIVE_CONTENT = _Functions._throwResponseWithData(doc[0]);

                      res.json(RECURSIVE_CONTENT);

                      client.close();
                    }
                  });
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError('users'));
                }
                break;

              default:
                const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

                res.json(RECURSIVE_CONTENT);
            }

            if (_IS_COLLECTION_READY_TO_ABSORB){
              _THREAD.modified_at = _THREAD.created_at = _TODAY;

              const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                    _COLLECTION = _DB.collection(_COLLECTION_NAME);

              _COLLECTION.insertOne(_THREAD, function(insertQueryError, doc){
                if (insertQueryError != null){
                  const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection insert request could\'t be processed.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  if (doc.insertedCount != 1){
                    const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The document in ${_COLLECTION_NAME} collection could\'t be inserted.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = _Functions._throwResponseWithData(doc.ops[0]);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                }
              });
            }
          }
        });
    }
  });
};
