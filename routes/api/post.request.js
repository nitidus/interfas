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
  app.post(`${Modules.Functions._getEndpointOfAPI()}/:collection`, (req, res) => {
    if (typeof req.params.collection != 'undefined'){
      var _COLLECTION_NAME = req.params.collection.toLowerCase(),
          _TODAY = new Date(),
          _THREAD = req.body,
          _IS_COLLECTION_READY_TO_ABSORB = false;

      MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
        if (connectionError != null){
            res.json(_LOCAL_FUNCTIONS._throwConnectionError());
          }else{
            var _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                _COLLECTION = _DB.collection(_COLLECTION_NAME);

            switch (_COLLECTION_NAME) {
              case 'verify':
                if (typeof _THREAD.phone != 'undefined'){
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
                    }
                  }

                  const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                        _COLLECTION = _DB.collection('users');

                  var _CHECKING_CRITERIA = {
                    "$or": []
                  };

                  if (typeof _THREAD.phone.mobile.content != 'undefined'){
                    _CHECKING_CRITERIA["$or"].push({
                      "email.content": _THREAD.email.content
                    })
                  }

                  if (typeof _THREAD.email.content != 'undefined'){
                    _CHECKING_CRITERIA["$or"].push({
                      "phone.mobile.content": _THREAD.phone.mobile.content
                    })
                  }

                  _COLLECTION.findOne(_CHECKING_CRITERIA, function(existingCheckQueryError, existingDoc){
                    if (existingCheckQueryError != null){
                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(existingCheckQueryError, 700);

                      res.json(RECURSIVE_CONTENT);
                    }else{
                      if (existingDoc != null){
                        let _FINAL_MESSAGE = '',
                            _MESSAGE_ITEM_COUNTS = 0;

                        if ((typeof existingDoc.email != 'undefined') && (typeof _THREAD.email.content != 'undefined')){
                          if (_THREAD.email.content === existingDoc.email.content){
                            _FINAL_MESSAGE += `${(_FINAL_MESSAGE != '')? ' and ': ''}Email`;
                            _MESSAGE_ITEM_COUNTS++;
                          }
                        }

                        if ((typeof existingDoc.phone != 'undefined') && (typeof _THREAD.phone.mobile.content != 'undefined')){
                          if (_THREAD.phone.mobile.content === existingDoc.phone.mobile.content){
                            _FINAL_MESSAGE += `${(_FINAL_MESSAGE != '')? ' and ': ''}Mobile phone`;
                            _MESSAGE_ITEM_COUNTS++;
                          }
                        }

                        if (_MESSAGE_ITEM_COUNTS > 1){
                          _FINAL_MESSAGE += ' are not available.';
                        }else{
                          _FINAL_MESSAGE += ' is not available.';
                        }

                        const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(_FINAL_MESSAGE, 700);

                        res.json(RECURSIVE_CONTENT);
                      }else{
                        if (typeof _THREAD.phone != 'undefined') {
                          if (typeof _THREAD.phone.mobile != 'undefined'){
                            Modules.Functions._sendMessage(_THREAD.phone.mobile.content, _THREAD.phone.mobile.validation.token)
                            .then((response) => {
                              //YOU CAN STORE YOUR RESPONSE IN DB
                            })
                            .catch((error) => {
                              const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(error.message, error.status);

                              res.json(RECURSIVE_CONTENT);
                            })
                          }
                        }

                        if (typeof _THREAD.email != 'undefined'){
                          if (typeof _THREAD.target != 'undefined'){
                            if (typeof _THREAD.target.app_name != 'undefined'){
                              Modules.Functions._sendVerification(_THREAD.target.app_name, {
                                target: {
                                  email: _THREAD.email,
                                  token: _SECRET_CONTENT_OF_TOKEN_WITH_APPENDED_KEY,
                                  created_at: _TODAY,
                                  modified_at: _TODAY
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

                        const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(_THREAD);

                        res.json(RECURSIVE_CONTENT);

                        client.close();
                      }
                    }
                  });
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'regenerate':
                if (typeof _THREAD.phone != 'undefined'){
                  if (typeof _THREAD.phone.mobile == 'string'){
                    _THREAD.phone.mobile = {
                      content: _THREAD.phone.mobile,
                      validation: {
                        token: Math.floor(Math.random() * ((999999 - 100000) + 1) + 100000).toString(),
                        value: false,
                        created_at: _TODAY,
                        modified_at: _TODAY
                      }
                    };
                  }else{
                    _THREAD.phone.mobile.validation.token = Math.floor(Math.random() * ((999999 - 100000) + 1) + 100000).toString();;
                    _THREAD.phone.mobile.validation.modified_at = _TODAY;
                  }

                  Modules.Functions._sendMessage(_THREAD.phone.mobile.content, _THREAD.phone.mobile.validation.token)
                  .then((response) => {
                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(_THREAD);

                    res.json(RECURSIVE_CONTENT);
                  })
                  .catch((error) => {
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(error.message, error.status);

                    res.json(RECURSIVE_CONTENT);
                  })
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'users':
                if ((typeof _THREAD.user_group_id != 'undefined') && (typeof _THREAD.password != 'undefined')){
                  const _SECRET_CONTENT_OF_PASSWORD = crypto.createCipher('aes192', _THREAD.password),
                        _SECRET_CONTENT_OF_PASSWORD_WITH_APPENDED_KEY = `${_SECRET_CONTENT_OF_PASSWORD.update(INTERFAS_KEY, 'utf8', 'hex')}${_SECRET_CONTENT_OF_PASSWORD.final('hex')}`;

                  _THREAD.password = _SECRET_CONTENT_OF_PASSWORD_WITH_APPENDED_KEY;

                  if (typeof _THREAD.personal != 'undefined'){
                    if (typeof _THREAD.personal.profile != 'undefined'){
                      const _SECRET_CONTENT_OF_FILE_NAME = `${_TODAY.getTime()}${Math.random()}${_THREAD.password}`,
                            _SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_SECRET_CONTENT_OF_PASSWORD).digest('hex'),
                            _FILE_EXTENSION_MIMETYPE = _THREAD.personal.profile.match(/data:image\/\w+/ig)[0].replace(/data:image\//ig, '');

                      _THREAD.personal.profile = `http://${req.headers.host}/${Modules.Functions._uploadUserProfilePhoto(_THREAD.personal.profile, `${_SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY}.${_FILE_EXTENSION_MIMETYPE}`)}`;
                    }
                  }

                  _THREAD.user_group_id = new ObjectID(_THREAD.user_group_id);
                  _THREAD.modified_at = _THREAD.created_at = _TODAY;

                  const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                        _COLLECTION = _DB.collection(_COLLECTION_NAME),
                        _DEPENDED_COLLECTION = _DB.collection('endusers');

                  var _END_USER_SEED = {
                    user_group_id: new ObjectID(_THREAD.user_group_id)
                  };

                  delete _THREAD.user_group_id;

                  _COLLECTION.insertOne(_THREAD, function(insertUserQueryError, userDoc){
                    if (insertUserQueryError != null){
                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection insert request could\'t be processed.`, 700);

                      res.json(RECURSIVE_CONTENT);
                    }else{
                      if (userDoc.insertedCount != 1){
                        const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in ${_COLLECTION_NAME} collection could\'t be inserted.`, 700);

                        res.json(RECURSIVE_CONTENT);
                      }else{
                        _END_USER_SEED.user_id = new ObjectID(userDoc.ops[0]._id);

                        _DEPENDED_COLLECTION.insertOne(_END_USER_SEED, function(insertEndUserQueryError, endUserDoc){
                          if (insertEndUserQueryError != null){
                            const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The End User collection insert request could\'t be processed.`, 700);

                            res.json(RECURSIVE_CONTENT);
                          }else{
                            if (endUserDoc.insertedCount != 1){
                              const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in End User collection could\'t be inserted.`, 700);

                              res.json(RECURSIVE_CONTENT);
                            }else{
                              const _RECURSIVE_RESPONSE = {
                                user: userDoc.ops[0],
                                end_user: endUserDoc.ops[0]
                              };

                              res.redirect(`/endusers/${_RECURSIVE_RESPONSE.end_user._id}`);
                            }
                          }

                          client.close();
                        })
                      }
                    }
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

                  if (typeof _THREAD.reference_id != 'undefined'){
                    _THREAD.reference_id = new ObjectID(_THREAD.reference_id);
                  }

                  if (typeof _THREAD.cardinal_id != 'undefined'){
                    _THREAD.cardinal_id = new ObjectID(_THREAD.cardinal_id);
                  }

                  if ((typeof _THREAD.cardinal_ancestors != 'undefined') && Array.isArray(_THREAD.cardinal_ancestors)){
                    _THREAD.cardinal_ancestors = _THREAD.cardinal_ancestors.map((ancestor, i) => {
                      const _FINAL_ANCESTOR = new ObjectID(ancestor);

                      return _FINAL_ANCESTOR;
                    });
                  }

                  //End User detection for user groups

                  _IS_COLLECTION_READY_TO_ABSORB = true;
                }else if ((typeof _THREAD.target != 'undefined') && (typeof _THREAD.user_group_id != 'undefined') && (typeof _THREAD.email != 'undefined')){
                  if (typeof _THREAD.email != 'undefined'){
                    const _SECRET_CONTENT_OF_TOKEN = `${_TODAY.getTime()}${Math.random()}${_THREAD.email}${_THREAD.user_group_id}`,
                          _SECRET_CONTENT_OF_TOKEN_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_SECRET_CONTENT_OF_TOKEN).digest('hex');

                    _THREAD.email = {
                      content: _THREAD.email,
                      validation: {
                        token: _SECRET_CONTENT_OF_TOKEN_WITH_APPENDED_KEY,
                        value: true
                      }
                    };

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

                  if (typeof _THREAD.reference_id != 'undefined'){
                    _THREAD.reference_id = new ObjectID(_THREAD.reference_id);
                  }

                  if (typeof _THREAD.cardinal_id != 'undefined'){
                    _THREAD.cardinal_id = new ObjectID(_THREAD.cardinal_id);
                  }

                  if ((typeof _THREAD.cardinal_ancestors != 'undefined') && Array.isArray(_THREAD.cardinal_ancestors)){
                    _THREAD.cardinal_ancestors = _THREAD.cardinal_ancestors.map((ancestor, i) => {
                      const _FINAL_ANCESTOR = new ObjectID(ancestor);

                      return _FINAL_ANCESTOR;
                    });
                  }

                  _THREAD.user_group_id = new ObjectID(_THREAD.user_group_id);
                  _THREAD.modified_at = _THREAD.created_at = _TODAY;

                  const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                        _COLLECTION = _DB.collection(_COLLECTION_NAME),
                        _DEPENDED_COLLECTION = _DB.collection('users');

                  var _CHECKING_CRITERIA = {
                    "$or": []
                  };

                  if (typeof _THREAD.email.content != 'undefined'){
                    _CHECKING_CRITERIA["$or"].push({
                      "email.content": _THREAD.email.content
                    })
                  }

                  _COLLECTION.findOne(_CHECKING_CRITERIA, function(existingCheckQueryError, existingDoc){
                    if (existingCheckQueryError != null){
                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(existingCheckQueryError, 700);

                      res.json(RECURSIVE_CONTENT);
                    }else{
                      if (existingDoc != null){
                        const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('The selected email or phone number is not available.', 700);

                        res.json(RECURSIVE_CONTENT);
                      }else{
                        var _END_USER_SEED = {
                          user_group_id: new ObjectID(_THREAD.user_group_id),
                          cardinal_id: new ObjectID(_THREAD.cardinal_id),
                        };

                        _END_USER_SEED.modified_at = _END_USER_SEED.created_at = _TODAY;

                        if (typeof _THREAD.reference_id != 'undefined'){
                          _END_USER_SEED.reference_id = _THREAD.reference_id;

                          delete _THREAD.reference_id;
                        }

                        if (typeof _THREAD.cardinal_id != 'undefined'){
                          _END_USER_SEED.cardinal_id = _THREAD.cardinal_id;

                          delete _THREAD.cardinal_id;
                        }

                        if (typeof _THREAD.cardinal_ancestors != 'undefined'){
                          _END_USER_SEED.cardinal_ancestors = _THREAD.cardinal_ancestors;

                          delete _THREAD.cardinal_ancestors;
                        }

                        delete _THREAD.user_group_id;
                        delete _THREAD.target;

                        _DEPENDED_COLLECTION.insertOne(_THREAD, function(insertUserQueryError, userDoc){
                          if (insertUserQueryError != null){
                            const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection insert request could\'t be processed.`, 700);

                            res.json(RECURSIVE_CONTENT);
                          }else{
                            if (userDoc.insertedCount != 1){
                              const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in ${_COLLECTION_NAME} collection could\'t be inserted.`, 700);

                              res.json(RECURSIVE_CONTENT);
                            }else{
                              _END_USER_SEED.user_id = new ObjectID(userDoc.ops[0]._id);

                              _COLLECTION.insertOne(_END_USER_SEED, function(insertEndUserQueryError, endUserDoc){
                                if (insertEndUserQueryError != null){
                                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The End User collection insert request could\'t be processed.`, 700);

                                  res.json(RECURSIVE_CONTENT);
                                }else{
                                  if (endUserDoc.insertedCount != 1){
                                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in End User collection could\'t be inserted.`, 700);

                                    res.json(RECURSIVE_CONTENT);
                                  }else{
                                    const _RECURSIVE_RESPONSE = {
                                      user: userDoc.ops[0],
                                      end_user: endUserDoc.ops[0]
                                    };

                                    res.redirect(`/endusers/${_RECURSIVE_RESPONSE.end_user._id}`);
                                  }
                                }

                                client.close();
                              })
                            }
                          }
                        });
                      }
                    }
                  });
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'usergroups':
                if ((typeof _THREAD.type != 'undefined') && (typeof _THREAD.role != 'undefined') && (typeof _THREAD.priority != 'undefined')){
                  _THREAD.type = Modules.Functions._convertTokenToKeyword(_THREAD.type);

                  if (typeof _THREAD.role != 'undefined'){
                    _THREAD.role = Modules.Functions._convertTokenToKeyword(_THREAD.role);
                  }

                  if (typeof _THREAD.reference_id != 'undefined'){
                    _THREAD.reference_id = new ObjectID(_THREAD.reference_id);
                  }

                  if (typeof _THREAD.cardinal_id != 'undefined'){
                    _THREAD.cardinal_id = new ObjectID(_THREAD.cardinal_id);
                  }

                  if ((typeof _THREAD.cardinal_ancestors != 'undefined') && Array.isArray(_THREAD.cardinal_ancestors)){
                    _THREAD.cardinal_ancestors = _THREAD.cardinal_ancestors.map((ancestor, i) => {
                      const _FINAL_ANCESTOR = new ObjectID(ancestor);

                      return _FINAL_ANCESTOR;
                    });
                  }

                  _IS_COLLECTION_READY_TO_ABSORB = true;
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'messages':
                if ((typeof _THREAD.receiver_id != 'undefined') && (typeof _THREAD.message != 'undefined')){
                  _THREAD.receiver_id = new ObjectID(_THREAD.receiver_id);

                  if (typeof _THREAD.message.type != 'undefined'){
                    _THREAD.message.type = Modules.Functions._convertTokenToKeyword(_THREAD.message.type);
                  }

                  if (typeof _THREAD.message.status != 'undefined'){
                    _THREAD.message.status = Modules.Functions._convertTokenToKeyword(_THREAD.message.status);
                  }

                  _IS_COLLECTION_READY_TO_ABSORB = true;
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'warehouses':
                if ((typeof _THREAD.end_user_id != 'undefined') && (typeof _THREAD.name != 'undefined')){
                  _THREAD.end_user_id = new ObjectID(_THREAD.end_user_id);

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

                  _THREAD.status = Modules.Functions._convertTokenToKeyword(_THREAD.status);
                  _THREAD.shipping = Modules.Functions._convertTokenToKeyword(_THREAD.shipping);

                  _IS_COLLECTION_READY_TO_ABSORB = true;
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
                }
                break;

              case 'currencies':
                if ((typeof _THREAD.type != 'undefined') && (typeof _THREAD.sign != 'undefined')){
                  const _CURRENCY_TYPE = _THREAD.type,
                        _CURRENCY_SIGN = _THREAD.sign;

                  if (_CURRENCY_TYPE != '' && _CURRENCY_SIGN != ''){
                    _THREAD.type = Modules.Functions._convertTokenToKeyword(_CURRENCY_TYPE);
                    _THREAD.sign = _CURRENCY_SIGN;

                    _IS_COLLECTION_READY_TO_ABSORB = true;
                  }
                }
                break;

              case 'taxonomies':
                if ((typeof _THREAD.key != 'undefined') && (typeof _THREAD.value != 'undefined')){
                  const _TAXONOMY_KEY = _THREAD.key,
                        _TAXONOMY_VALUE = _THREAD.value;
                        _OPTIONS = req.query;

                  if (_TAXONOMY_KEY != '' && _TAXONOMY_VALUE != ''){
                    const _CONTENT_PROCESS_OPTION = _OPTIONS.process_content || _OPTIONS.processContent || _OPTIONS.pc || _OPTIONS.PC,
                          _HAS_CONTENT_PROCESS_OPTION = (typeof _CONTENT_PROCESS_OPTION == 'undefined')? true: (((_CONTENT_PROCESS_OPTION.toLowerCase() == 'false') || (_CONTENT_PROCESS_OPTION == '0'))? false: true);

                    _THREAD.key = Modules.Functions._convertTokenToKeyword(_TAXONOMY_KEY);

                    if (_HAS_CONTENT_PROCESS_OPTION){
                      _THREAD.value = Modules.Functions._convertTokenToKeyword(_TAXONOMY_VALUE);
                    }

                    if (typeof _THREAD.ancestors != 'undefined'){
                      _THREAD.ancestors = _THREAD.ancestors.map((ancestor, i) => {
                        const _FINAL_ANCESTOR = new ObjectID(ancestor);

                        return _FINAL_ANCESTOR;
                      });
                    }

                    _IS_COLLECTION_READY_TO_ABSORB = true;
                  }
                }
                break;

              case 'plans':
                if ((typeof _THREAD.taxonomy_id != 'undefined') && (typeof _THREAD.name != 'undefined') && (typeof _THREAD.amount != 'undefined') && (typeof _THREAD.price != 'undefined')){
                  const _PLAN_TAXONOMY_ID = new ObjectID(_THREAD.taxonomy_id),
                        _PLAN_NAME = Modules.Functions._convertKeywordToToken(_THREAD.name),
                        _IS_PLAN_AMOUNT_VALID = Modules.Functions._checkIsAValidNumericOnlyField(_THREAD.amount.toString()),
                        _STRIPED_PRICE = _THREAD.price.toString().replace(/,+/g, ''),
                        _IS_PLAN_PRICE_VALID = Modules.Functions._checkIsAValidNumericOnlyField(_STRIPED_PRICE);

                  if (_IS_PLAN_AMOUNT_VALID && _IS_PLAN_PRICE_VALID){
                    const _PLAN_AMOUNT = parseInt(_THREAD.amount),
                          _PLAN_PRICE = parseFloat(parseFloat(_STRIPED_PRICE).toFixed(2));

                    if (_PLAN_TAXONOMY_ID != '' && _PLAN_NAME != '' && _PLAN_AMOUNT > 0 && _PLAN_PRICE > 0){
                      _THREAD.taxonomy_id = _PLAN_TAXONOMY_ID;
                      _THREAD.name = _PLAN_NAME;
                      _THREAD.amount = _PLAN_AMOUNT;
                      _THREAD.price = _PLAN_PRICE;

                      _IS_COLLECTION_READY_TO_ABSORB = true;
                    }
                  }
                }
                break;

              case 'products':
                if ((typeof _THREAD.name != 'undefined') && (typeof _THREAD.photos != 'undefined') && (typeof _THREAD.category_id != 'undefined')){
                  const _TARGET_URI = _THREAD.category_id;

                  _THREAD.category_id = new ObjectID(_THREAD.category_id);

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

                  _THREAD.photos = _THREAD.photos.map((item, i) => {
                    let _FINAL_ITEM = item;

                    const _SECRET_CONTENT_OF_FILE_NAME = `${_TODAY.getTime()}${Math.random()}`,
                          _SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_TARGET_URI).digest('hex'),
                          _FILE_EXTENSION_MIMETYPE = _FINAL_ITEM.content.match(/data:image\/\w+/ig)[0].replace(/data:image\//ig, '');

                    _FINAL_ITEM.content = `http://${req.headers.host}/${Modules.Functions._uploadProductPhoto(_FINAL_ITEM.content, `${_TARGET_URI}/${_SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY}.${_FILE_EXTENSION_MIMETYPE}`)}`;

                    return _FINAL_ITEM;
                  });

                  _IS_COLLECTION_READY_TO_ABSORB = true;
                }
                break;

              case 'fragments':
                if ((typeof _THREAD.end_user_id != 'undefined') && (typeof _THREAD.product_id != 'undefined') && (typeof _THREAD.content != 'undefined')){
                  _THREAD.end_user_id = new ObjectID(_THREAD.end_user_id);
                  _THREAD.product_id = new ObjectID(_THREAD.product_id);

                  if (typeof _THREAD.cardinal_id != 'undefined'){
                    _THREAD.cardinal_id = new ObjectID(_THREAD.cardinal_id);
                  }

                  if (typeof _THREAD.content != 'undefined'){
                    _THREAD.content = _THREAD.content.map((item, i) => {
                      let _FINAL_ITEM = item;

                      if (typeof _FINAL_ITEM.unit_id != 'undefined'){
                        _FINAL_ITEM.unit_id = new ObjectID(_FINAL_ITEM.unit_id);
                      }

                      if (typeof _FINAL_ITEM.warehouse_id != 'undefined'){
                        _FINAL_ITEM.warehouse_id = new ObjectID(_FINAL_ITEM.warehouse_id);
                      }

                      if (typeof _FINAL_ITEM.shipping_method_id != 'undefined'){
                        _FINAL_ITEM.shipping_method_id = new ObjectID(_FINAL_ITEM.shipping_method_id);
                      }

                      return _FINAL_ITEM;
                    });
                  }

                  _IS_COLLECTION_READY_TO_ABSORB = true;
                }
                break;

              case 'wallets':
                if (
                  (typeof _THREAD.end_user_id != 'undefined') &&
                  ((typeof _THREAD.wallet_name != 'undefined') || (typeof _THREAD.name != 'undefined')) &&
                  (typeof _THREAD.currency_id != 'undefined')
                ){
                  const _END_USER_ID = new ObjectID(_THREAD.end_user_id),
                        _WALLET_NAME = _THREAD.wallet_name || _THREAD.name,
                        _CURRENCY_ID = new ObjectID(_THREAD.currency_id),
                        _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                        _COLLECTION = _DB.collection(_COLLECTION_NAME);

                  var _TARGET = {
                        end_user_id: _END_USER_ID,
                        currency_id: _CURRENCY_ID,
                        name: _WALLET_NAME,
                        modified_at: _TODAY,
                        created_at: _TODAY
                      },
                      _DO_YOU_NEED_TO_FETCH_PLAN = false;

                  if (
                    ((typeof _THREAD.card != 'undefined') || (typeof _THREAD.credit_card != 'undefined') || (typeof _THREAD.debit_card != 'undefined'))
                  ){
                    const _CHARGE_CARD = _THREAD.card || _THREAD.credit_card || _THREAD.debit_card,
                          _CHARGE_CURRENCY = _THREAD.currency || _THREAD.currency_type || 'usd';

                    if (
                      (typeof _THREAD.plan != 'undefined') || (typeof _THREAD.wallet_plan != 'undefined') || (typeof _THREAD.initial_wallet_plan != 'undefined') || (typeof _THREAD.initial_plan != 'undefined') ||
                      (typeof _THREAD.plan_id != 'undefined') || (typeof _THREAD.wallet_plan_id != 'undefined') || (typeof _THREAD.initial_wallet_plan_id != 'undefined') || (typeof _THREAD.initial_plan_id != 'undefined')
                    ){
                      if (
                        ((typeof _THREAD.balance != 'undefined') || (typeof _THREAD.wallet_balance != 'undefined') || (typeof _THREAD.initial_wallet_balance != 'undefined') || (typeof _THREAD.initial_balance != 'undefined')) &&
                        ((typeof _THREAD.amount != 'undefined') || (typeof _THREAD.price != 'undefined'))
                      ){
                        const _BALANCE = _THREAD.balance || _THREAD.wallet_balance || _THREAD.initial_wallet_balance || _THREAD.initial_balance;

                        _TARGET.balance = _BALANCE;
                      }else{
                        const _PLAN_ID = _THREAD.plan || _THREAD.wallet_plan || _THREAD.initial_wallet_plan || _THREAD.initial_plan || _THREAD.plan_id || _THREAD.wallet_plan_id || _THREAD.initial_wallet_plan_id || _THREAD.initial_plan_id,
                              _DEPENDED_COLLECTION = _DB.collection('plans');

                        var _CHECKING_CRITERIA = {
                          _id: new ObjectID(_PLAN_ID)
                        };

                        _DEPENDED_COLLECTION.findOne(_CHECKING_CRITERIA, function(planFindQueryError, doc){
                          if (planFindQueryError != null){
                            const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The plans collection find request could\'t be processed.`, 700);

                            res.json(RECURSIVE_CONTENT);
                          }else{
                            const _BALANCE = doc.price,
                                  _CHARGE_AMOUNT = doc.amount;

                            _TARGET.balance = _BALANCE;

                            _COLLECTION.insertOne(_TARGET, function(insertQueryError, walletDoc){
                              if (insertQueryError != null){
                                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection insert request could\'t be processed.`, 700);

                                res.json(RECURSIVE_CONTENT);
                              }else{
                                if (walletDoc.insertedCount != 1){
                                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in ${_COLLECTION_NAME} collection could\'t be inserted.`, 700);

                                  res.json(RECURSIVE_CONTENT);
                                }else{
                                  const _WALLET = walletDoc.ops[0];

                                  if (
                                    ((typeof _CHARGE_CARD.number != 'undefined') || (typeof _CHARGE_CARD.credit_card_number != 'undefined') || (typeof _CHARGE_CARD.debit_card_number != 'undefined')) &&
                                    ((typeof _CHARGE_CARD.expiration_date != 'undefined')? ((typeof _CHARGE_CARD.expiration_date.month != 'undefined') && (typeof _CHARGE_CARD.expiration_date.year != 'undefined')): (((typeof _CHARGE_CARD.exp_month != 'undefined') || (typeof _CHARGE_CARD.expiration_month != 'undefined')) && ((typeof _CHARGE_CARD.exp_year != 'undefined') || (typeof _CHARGE_CARD.expiration_year != 'undefined')))) &&
                                    ((typeof _CHARGE_CARD.cvc != 'undefined') || (typeof _CHARGE_CARD.cvv != 'undefined') || (typeof _CHARGE_CARD.cid != 'undefined') || (typeof _CHARGE_CARD.cvp != 'undefined') || (typeof _CHARGE_CARD.cve != 'undefined'))
                                  ){
                                    const _CREDIT_CARD_NUMBER = _CHARGE_CARD.number || _CHARGE_CARD.credit_card_number || _CHARGE_CARD.debit_card_number,
                                          _STRIPED_CREDIT_CARD_NUMBER = _CREDIT_CARD_NUMBER.replace(/(_|-| )+/ig, ''),
                                          _EXPIRATION_MONTH = (typeof _CHARGE_CARD.expiration_date != 'undefined')? _CHARGE_CARD.expiration_date.month: (_CHARGE_CARD.exp_month || _CHARGE_CARD.expiration_month),
                                          _EXPIRATION_YEAR = (typeof _CHARGE_CARD.expiration_date != 'undefined')? _CHARGE_CARD.expiration_date.year: (_CHARGE_CARD.exp_year || _CHARGE_CARD.expiration_year),
                                          _CVC = _CHARGE_CARD.cvc || _CHARGE_CARD.cvv || _CHARGE_CARD.cid || _CHARGE_CARD.cvp || _CHARGE_CARD.cve;

                                    if (!isNaN(_STRIPED_CREDIT_CARD_NUMBER) && !isNaN(_EXPIRATION_MONTH) && !isNaN(_EXPIRATION_YEAR) && !isNaN(_CVC)){
                                      const _FINAL_CREDIT_CARD_NUMBER = _STRIPED_CREDIT_CARD_NUMBER,
                                            _FINAL_EXPIRATION_MONTH = parseInt(_EXPIRATION_MONTH),
                                            _FINAL_EXPIRATION_YEAR = parseInt(_EXPIRATION_YEAR),
                                            _FINAL_CVC = _CVC;

                                      var _CHARGE_SEED = {
                                            card: {
                                              number: _FINAL_CREDIT_CARD_NUMBER,
                                              exp_month: _FINAL_EXPIRATION_MONTH,
                                              exp_year: _FINAL_EXPIRATION_YEAR,
                                              cvc: _FINAL_CVC
                                            },
                                            amount: _CHARGE_AMOUNT,
                                            currency: _CHARGE_CURRENCY
                                          },
                                          _IS_TRANSACTION_READY_TO_LAUNCH = true;


                                      if ((typeof _THREAD.receipt_email != 'undefined') || (typeof _THREAD.email != 'undefined')){
                                        const _RECEIPT_EMAIL = _THREAD.receipt_email || _THREAD.email;

                                        _CHARGE_SEED = {
                                          ..._CHARGE_SEED,
                                          receipt_email: _RECEIPT_EMAIL
                                        };
                                      }

                                      if ((typeof _THREAD.description != 'undefined') || (typeof _THREAD.caption != 'undefined')){
                                        const _DESCRIPTION = _THREAD.description || _THREAD.caption;

                                        _CHARGE_SEED = {
                                          ..._CHARGE_SEED,
                                          description: _DESCRIPTION
                                        };
                                      }

                                      if ((typeof _THREAD.meta_data != 'undefined') || (typeof _THREAD.extra_data != 'undefined')){
                                        const _META_DATA = _THREAD.meta_data || _THREAD.extra_data;

                                        _CHARGE_SEED = {
                                          ..._CHARGE_SEED,
                                          meta_data: {
                                            ..._META_DATA,
                                            end_user_id: _THREAD.end_user_id.toString()
                                          }
                                        };
                                      }else{
                                        _CHARGE_SEED = {
                                          ..._CHARGE_SEED,
                                          meta_data: {
                                            end_user_id: _THREAD.end_user_id.toString()
                                          }
                                        };
                                      }

                                      if (typeof _WALLET._id != 'undefined'){
                                        _CHARGE_SEED = {
                                          ..._CHARGE_SEED,
                                          meta_data: {
                                            ..._CHARGE_SEED.meta_data,
                                            wallet_id: _WALLET._id.toString()
                                          }
                                        };
                                      }

                                      if ((typeof _THREAD.shipping != 'undefined') || (typeof _THREAD.shipping_detail != 'undefined')){
                                        const _SHIPPINNG = _THREAD.shipping || _THREAD.shipping_detail;

                                        if (
                                          ((typeof _SHIPPINNG.address != 'undefined') || (typeof _SHIPPINNG.shipping_address != 'undefined') || (typeof _SHIPPINNG.billing_address != 'undefined')) &&
                                          ((typeof _SHIPPINNG.name != 'undefined') || (typeof _SHIPPINNG.shipping_name != 'undefined') || (typeof _SHIPPINNG.billing_name != 'undefined') || (typeof _SHIPPINNG.owner != 'undefined') || (typeof _SHIPPINNG.shipping_owner != 'undefined') || (typeof _SHIPPINNG.billing_owner != 'undefined'))
                                        ){
                                          const _SHIPPING_ADDRESS = _SHIPPINNG.address || _SHIPPINNG.shipping_address || _SHIPPINNG.billing_address,
                                                _SHIPPING_ADDRESS_OWNER = _SHIPPINNG.name || _SHIPPINNG.shipping_name || _SHIPPINNG.billing_name || _SHIPPINNG.owner || _SHIPPINNG.shipping_owner || _SHIPPINNG.billing_owner;

                                          if (typeof _SHIPPING_ADDRESS.line1 != 'undefined'){
                                            var _SHIPPINNG_SEED = {
                                              address: _SHIPPING_ADDRESS,
                                              name: _SHIPPING_ADDRESS_OWNER
                                            };

                                            if (typeof _SHIPPINNG_SEED.carrier != 'undefined'){
                                              _SHIPPINNG_SEED.carrier = _SHIPPINNG_SEED.carrier;
                                            }

                                            if (typeof _SHIPPINNG_SEED.tracking_number != 'undefined'){
                                              _SHIPPINNG_SEED.tracking_number = _SHIPPINNG_SEED.tracking_number;
                                            }

                                            if (typeof _SHIPPINNG_SEED.carrier != 'undefined'){
                                              _SHIPPINNG_SEED.carrier = _SHIPPINNG_SEED.carrier;
                                            }

                                            _CHARGE_SEED = {
                                              ..._CHARGE_SEED,
                                              shipping: _SHIPPINNG_SEED
                                            };
                                          }else{
                                            _IS_TRANSACTION_READY_TO_LAUNCH = false;
                                          }
                                        }else{
                                          _IS_TRANSACTION_READY_TO_LAUNCH = false;
                                        }
                                      }

                                      if (_IS_TRANSACTION_READY_TO_LAUNCH){
                                        Modules.Functions._chargeUsingToken(_CHARGE_SEED)
                                        .then((charge) => {
                                          if ((typeof charge.status != 'undefined') && (charge.status === "succeeded")){
                                            const _LOG_COLLECTION = _DB.collection('histories');

                                            var _LOG_TARGET = {
                                              end_user_id: _END_USER_ID,
                                              wallet_id: new ObjectID(_WALLET._id),
                                              plan_id: new ObjectID(_PLAN_ID),
                                              previous_balance: 0,
                                              new_balance: _BALANCE,
                                              content: charge,
                                              modified_at: _TODAY,
                                              created_at: _TODAY
                                            };

                                            _LOG_COLLECTION.insertOne(_LOG_TARGET, function(logQueryError, historyDoc){
                                              if (logQueryError != null){
                                                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The histories collection insert request could\'t be processed.`, 700);

                                                res.json(RECURSIVE_CONTENT);
                                              }else{
                                                if (historyDoc.insertedCount != 1){
                                                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in histories collection could\'t be inserted.`, 700);

                                                  res.json(RECURSIVE_CONTENT);
                                                }else{
                                                  const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData({
                                                    wallet: _WALLET,
                                                    history: historyDoc.ops[0]
                                                  });

                                                  res.json(RECURSIVE_CONTENT);

                                                  client.close();
                                                }
                                              }
                                            });
                                          }
                                        })
                                        .catch((error) => {
                                          let _ERROR = error,
                                              RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(error.message.message);

                                          delete _ERROR.message;

                                          res.json({
                                            ...RECURSIVE_CONTENT,
                                            ..._ERROR
                                          });
                                        });
                                      }
                                    }
                                  }
                                }
                              }
                            });
                          }
                        });

                        _DO_YOU_NEED_TO_FETCH_PLAN = true;
                      }
                    }else if (
                      ((typeof _THREAD.balance != 'undefined') || (typeof _THREAD.wallet_balance != 'undefined') || (typeof _THREAD.initial_wallet_balance != 'undefined') || (typeof _THREAD.initial_balance != 'undefined')) &&
                      ((typeof _THREAD.amount != 'undefined') && (!isNaN(_THREAD.amount)))
                    ) {
                      const _BALANCE = _THREAD.balance || _THREAD.wallet_balance || _THREAD.initial_wallet_balance || _THREAD.initial_balance;

                      _TARGET.balance = _BALANCE;
                    }

                    if (_DO_YOU_NEED_TO_FETCH_PLAN === false){
                      _COLLECTION.insertOne(_TARGET, function(insertQueryError, walletDoc){
                        if (insertQueryError != null){
                          const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection insert request could\'t be processed.`, 700);

                          res.json(RECURSIVE_CONTENT);
                        }else{
                          if (walletDoc.insertedCount != 1){
                            const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in ${_COLLECTION_NAME} collection could\'t be inserted.`, 700);

                            res.json(RECURSIVE_CONTENT);
                          }else{
                            const _WALLET = walletDoc.ops[0];

                            if (
                              ((typeof _CHARGE_CARD.number != 'undefined') || (typeof _CHARGE_CARD.credit_card_number != 'undefined') || (typeof _CHARGE_CARD.debit_card_number != 'undefined')) &&
                              ((typeof _CHARGE_CARD.expiration_date != 'undefined')? ((typeof _CHARGE_CARD.expiration_date.month != 'undefined') && (typeof _CHARGE_CARD.expiration_date.year != 'undefined')): (((typeof _CHARGE_CARD.exp_month != 'undefined') || (typeof _CHARGE_CARD.expiration_month != 'undefined')) && ((typeof _CHARGE_CARD.exp_year != 'undefined') || (typeof _CHARGE_CARD.expiration_year != 'undefined')))) &&
                              ((typeof _CHARGE_CARD.cvc != 'undefined') || (typeof _CHARGE_CARD.cvv != 'undefined') || (typeof _CHARGE_CARD.cid != 'undefined') || (typeof _CHARGE_CARD.cvp != 'undefined') || (typeof _CHARGE_CARD.cve != 'undefined'))
                            ){
                              const _CREDIT_CARD_NUMBER = _CHARGE_CARD.number || _CHARGE_CARD.credit_card_number || _CHARGE_CARD.debit_card_number,
                                    _STRIPED_CREDIT_CARD_NUMBER = _CREDIT_CARD_NUMBER.replace(/(_|-| )+/ig, ''),
                                    _EXPIRATION_MONTH = (typeof _CHARGE_CARD.expiration_date != 'undefined')? _CHARGE_CARD.expiration_date.month: (_CHARGE_CARD.exp_month || _CHARGE_CARD.expiration_month),
                                    _EXPIRATION_YEAR = (typeof _CHARGE_CARD.expiration_date != 'undefined')? _CHARGE_CARD.expiration_date.year: (_CHARGE_CARD.exp_year || _CHARGE_CARD.expiration_year),
                                    _CVC = _CHARGE_CARD.cvc || _CHARGE_CARD.cvv || _CHARGE_CARD.cid || _CHARGE_CARD.cvp || _CHARGE_CARD.cve;

                              if (!isNaN(_STRIPED_CREDIT_CARD_NUMBER) && !isNaN(_EXPIRATION_MONTH) && !isNaN(_EXPIRATION_YEAR) && !isNaN(_CVC)){
                                const _FINAL_CREDIT_CARD_NUMBER = _STRIPED_CREDIT_CARD_NUMBER,
                                      _FINAL_EXPIRATION_MONTH = parseInt(_EXPIRATION_MONTH),
                                      _FINAL_EXPIRATION_YEAR = parseInt(_EXPIRATION_YEAR),
                                      _FINAL_CVC = _CVC;

                                var _CHARGE_SEED = {
                                      card: {
                                        number: _FINAL_CREDIT_CARD_NUMBER,
                                        exp_month: _FINAL_EXPIRATION_MONTH,
                                        exp_year: _FINAL_EXPIRATION_YEAR,
                                        cvc: _FINAL_CVC
                                      },
                                      currency: _CHARGE_CURRENCY
                                    },
                                    _IS_TRANSACTION_READY_TO_LAUNCH = true;

                                if ((typeof _THREAD.amount != 'undefined') || (typeof _THREAD.price != 'undefined')){
                                  const _AMOUNT = _THREAD.amount || _THREAD.price;

                                  if (!isNaN(_AMOUNT)){
                                    _CHARGE_SEED = {
                                      ..._CHARGE_SEED,
                                      amount: parseInt(_AMOUNT)
                                    };
                                  }
                                }

                                if ((typeof _THREAD.receipt_email != 'undefined') || (typeof _THREAD.email != 'undefined')){
                                  const _RECEIPT_EMAIL = _THREAD.receipt_email || _THREAD.email;

                                  _CHARGE_SEED = {
                                    ..._CHARGE_SEED,
                                    receipt_email: _RECEIPT_EMAIL
                                  };
                                }

                                if ((typeof _THREAD.description != 'undefined') || (typeof _THREAD.caption != 'undefined')){
                                  const _DESCRIPTION = _THREAD.description || _THREAD.caption;

                                  _CHARGE_SEED = {
                                    ..._CHARGE_SEED,
                                    description: _DESCRIPTION
                                  };
                                }

                                if ((typeof _THREAD.meta_data != 'undefined') || (typeof _THREAD.extra_data != 'undefined')){
                                  const _META_DATA = _THREAD.meta_data || _THREAD.extra_data;

                                  _CHARGE_SEED = {
                                    ..._CHARGE_SEED,
                                    meta_data: {
                                      ..._META_DATA,
                                      end_user_id: _THREAD.end_user_id.toString()
                                    }
                                  };
                                }else{
                                  _CHARGE_SEED = {
                                    ..._CHARGE_SEED,
                                    meta_data: {
                                      end_user_id: _THREAD.end_user_id.toString()
                                    }
                                  };
                                }

                                if (typeof _WALLET._id != 'undefined'){
                                  _CHARGE_SEED = {
                                    ..._CHARGE_SEED,
                                    meta_data: {
                                      ..._CHARGE_SEED.meta_data,
                                      wallet_id: _WALLET._id.toString()
                                    }
                                  };
                                }

                                if ((typeof _THREAD.shipping != 'undefined') || (typeof _THREAD.shipping_detail != 'undefined')){
                                  const _SHIPPINNG = _THREAD.shipping || _THREAD.shipping_detail;

                                  if (
                                    ((typeof _SHIPPINNG.address != 'undefined') || (typeof _SHIPPINNG.shipping_address != 'undefined') || (typeof _SHIPPINNG.billing_address != 'undefined')) &&
                                    ((typeof _SHIPPINNG.name != 'undefined') || (typeof _SHIPPINNG.shipping_name != 'undefined') || (typeof _SHIPPINNG.billing_name != 'undefined') || (typeof _SHIPPINNG.owner != 'undefined') || (typeof _SHIPPINNG.shipping_owner != 'undefined') || (typeof _SHIPPINNG.billing_owner != 'undefined'))
                                  ){
                                    const _SHIPPING_ADDRESS = _SHIPPINNG.address || _SHIPPINNG.shipping_address || _SHIPPINNG.billing_address,
                                          _SHIPPING_ADDRESS_OWNER = _SHIPPINNG.name || _SHIPPINNG.shipping_name || _SHIPPINNG.billing_name || _SHIPPINNG.owner || _SHIPPINNG.shipping_owner || _SHIPPINNG.billing_owner;

                                    if (typeof _SHIPPING_ADDRESS.line1 != 'undefined'){
                                      var _SHIPPINNG_SEED = {
                                        address: _SHIPPING_ADDRESS,
                                        name: _SHIPPING_ADDRESS_OWNER
                                      };

                                      if (typeof _SHIPPINNG_SEED.carrier != 'undefined'){
                                        _SHIPPINNG_SEED.carrier = _SHIPPINNG_SEED.carrier;
                                      }

                                      if (typeof _SHIPPINNG_SEED.tracking_number != 'undefined'){
                                        _SHIPPINNG_SEED.tracking_number = _SHIPPINNG_SEED.tracking_number;
                                      }

                                      if (typeof _SHIPPINNG_SEED.carrier != 'undefined'){
                                        _SHIPPINNG_SEED.carrier = _SHIPPINNG_SEED.carrier;
                                      }

                                      _CHARGE_SEED = {
                                        ..._CHARGE_SEED,
                                        shipping: _SHIPPINNG_SEED
                                      };
                                    }else{
                                      _IS_TRANSACTION_READY_TO_LAUNCH = false;
                                    }
                                  }else{
                                    _IS_TRANSACTION_READY_TO_LAUNCH = false;
                                  }
                                }

                                if (_IS_TRANSACTION_READY_TO_LAUNCH){
                                  Modules.Functions._chargeUsingToken(_CHARGE_SEED)
                                  .then((charge) => {
                                    if ((typeof charge.status != 'undefined') && (charge.status === "succeeded")){
                                      const _LOG_COLLECTION = _DB.collection('histories');

                                      var _LOG_TARGET = {
                                        end_user_id: _END_USER_ID,
                                        wallet_id: new ObjectID(_WALLET._id),
                                        previous_balance: 0,
                                        new_balance: _BALANCE,
                                        content: charge,
                                        modified_at: _TODAY,
                                        created_at: _TODAY
                                      };

                                      if ((typeof _THREAD.plan) || (typeof _THREAD.wallet_plan != 'undefined') || (typeof _THREAD.initial_wallet_plan != 'undefined') || (typeof _THREAD.initial_plan != 'undefined') || (typeof _THREAD.plan_id != 'undefined') || (typeof _THREAD.wallet_plan_id != 'undefined') || (typeof _THREAD.initial_wallet_plan_id != 'undefined') || (typeof _THREAD.initial_plan_id != 'undefined')){
                                        const _PLAN_ID = _THREAD.plan || _THREAD.wallet_plan || _THREAD.initial_wallet_plan || _THREAD.initial_plan || _THREAD.plan_id || _THREAD.wallet_plan_id || _THREAD.initial_wallet_plan_id || _THREAD.initial_plan_id;

                                        _LOG_TARGET = {
                                          ..._LOG_TARGET,
                                          plan_id: new ObjectID(_PLAN_ID._id)
                                        }
                                      }

                                      _LOG_COLLECTION.insertOne(_LOG_TARGET, function(logQueryError, historyDoc){
                                        if (logQueryError != null){
                                          const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The histories collection insert request could\'t be processed.`, 700);

                                          res.json(RECURSIVE_CONTENT);
                                        }else{
                                          if (historyDoc.insertedCount != 1){
                                            const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in histories collection could\'t be inserted.`, 700);

                                            res.json(RECURSIVE_CONTENT);
                                          }else{
                                            const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData({
                                              wallet: _WALLET,
                                              history: historyDoc.ops[0]
                                            });

                                            res.json(RECURSIVE_CONTENT);

                                            client.close();
                                          }
                                        }
                                      });
                                    }
                                  })
                                  .catch((error) => {
                                    let _ERROR = error,
                                        RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(error.message.message);

                                    delete _ERROR.message;

                                    res.json({
                                      ...RECURSIVE_CONTENT,
                                      ..._ERROR
                                    });
                                  });
                                }
                              }
                            }
                          }
                        }
                      });
                    }
                  }
                }
                break;

              case 'histories':
                if (
                  (typeof _THREAD.end_user_id != 'undefined') &&
                  ((typeof _THREAD.balance != 'undefined') && (!isNaN(_THREAD.balance))) &&
                  ((typeof _THREAD.card != 'undefined') || (typeof _THREAD.credit_card != 'undefined') || (typeof _THREAD.debit_card != 'undefined')) &&
                  ((typeof _THREAD.amount != 'undefined') && (!isNaN(_THREAD.amount)))
                  ){
                    const _END_USER_ID = new ObjectID(_THREAD.end_user_id),
                          _CARD = _THREAD.card || _THREAD.credit_card || _THREAD.debit_card,
                          _AMOUNT = parseInt(_THREAD.amount),
                          _BALANCE = parseInt(_THREAD.balance),
                          _CURRENCY = _THREAD.currency || _THREAD.currency_type || 'usd';

                    if (Object.keys(_CARD).length > 0){
                      if (
                        ((typeof _CARD.number != 'undefined') || (typeof _CARD.credit_card_number != 'undefined') || (typeof _CARD.debit_card_number != 'undefined')) &&
                        ((typeof _CARD.expiration_date != 'undefined')? ((typeof _CARD.expiration_date.month != 'undefined') && (typeof _CARD.expiration_date.year != 'undefined')): (((typeof _CARD.exp_month != 'undefined') || (typeof _CARD.expiration_month != 'undefined')) && ((typeof _CARD.exp_year != 'undefined') || (typeof _CARD.expiration_year != 'undefined')))) &&
                        ((typeof _CARD.cvc != 'undefined') || (typeof _CARD.cvv != 'undefined') || (typeof _CARD.cid != 'undefined') || (typeof _CARD.cvp != 'undefined') || (typeof _CARD.cve != 'undefined'))
                      ){
                        const _CREDIT_CARD_NUMBER = _CARD.number || _CARD.credit_card_number || _CARD.debit_card_number,
                              _STRIPED_CREDIT_CARD_NUMBER = _CREDIT_CARD_NUMBER.replace(/(_|-| )+/ig, ''),
                              _EXPIRATION_MONTH = (typeof _CARD.expiration_date != 'undefined')? _CARD.expiration_date.month: (_CARD.exp_month || _CARD.expiration_month),
                              _EXPIRATION_YEAR = (typeof _CARD.expiration_date != 'undefined')? _CARD.expiration_date.year: (_CARD.exp_year || _CARD.expiration_year),
                              _CVC = _CARD.cvc || _CARD.cvv || _CARD.cid || _CARD.cvp || _CARD.cve;

                        if (!isNaN(_STRIPED_CREDIT_CARD_NUMBER) && !isNaN(_EXPIRATION_MONTH) && !isNaN(_EXPIRATION_YEAR) && !isNaN(_CVC)){
                          const _FINAL_CREDIT_CARD_NUMBER = _STRIPED_CREDIT_CARD_NUMBER,
                                _FINAL_EXPIRATION_MONTH = parseInt(_EXPIRATION_MONTH),
                                _FINAL_EXPIRATION_YEAR = parseInt(_EXPIRATION_YEAR),
                                _FINAL_CVC = _CVC;

                          var _CHARGE_SEED = {
                                card: {
                                  number: _FINAL_CREDIT_CARD_NUMBER,
                                  exp_month: _FINAL_EXPIRATION_MONTH,
                                  exp_year: _FINAL_EXPIRATION_YEAR,
                                  cvc: _FINAL_CVC
                                },
                                amount: _AMOUNT,
                                currency: _CURRENCY
                              },
                              _IS_TRANSACTION_READY_TO_LAUNCH = true;

                          if ((typeof _CHARGE_SEED.receipt_email != 'undefined') || (typeof _CHARGE_SEED.email != 'undefined')){
                            const _RECEIPT_EMAIL = _CHARGE_SEED.receipt_email || _CHARGE_SEED.email;

                            _CHARGE_SEED = {
                              ..._CHARGE_SEED,
                              receipt_email: _RECEIPT_EMAIL
                            };
                          }

                          if ((typeof _CHARGE_SEED.description != 'undefined') || (typeof _CHARGE_SEED.caption != 'undefined')){
                            const _DESCRIPTION = _CHARGE_SEED.description || _CHARGE_SEED.caption;

                            _CHARGE_SEED = {
                              ..._CHARGE_SEED,
                              description: _DESCRIPTION
                            };
                          }

                          if ((typeof _CHARGE_SEED.meta_data != 'undefined') || (typeof _CHARGE_SEED.extra_data != 'undefined')){
                            const _META_DATA = _CHARGE_SEED.meta_data || _CHARGE_SEED.extra_data;

                            _CHARGE_SEED = {
                              ..._CHARGE_SEED,
                              meta_data: {
                                ..._META_DATA,
                                end_user_id: _THREAD.end_user_id
                              }
                            };
                          }else{
                            _CHARGE_SEED = {
                              ..._CHARGE_SEED,
                              meta_data: {
                                end_user_id: _THREAD.end_user_id
                              }
                            };
                          }

                          if (typeof _THREAD.wallet_id != 'undefined'){
                            _CHARGE_SEED = {
                              ..._CHARGE_SEED,
                              meta_data: {
                                ..._CHARGE_SEED.meta_data,
                                wallet_id: _THREAD.wallet_id
                              }
                            };
                          }

                          if ((typeof _CHARGE_SEED.shipping != 'undefined') || (typeof _CHARGE_SEED.shipping_detail != 'undefined')){
                            const _SHIPPINNG = _CHARGE_SEED.shipping || _CHARGE_SEED.shipping_detail;

                            if (
                              ((typeof _SHIPPINNG.address != 'undefined') || (typeof _SHIPPINNG.shipping_address != 'undefined') || (typeof _SHIPPINNG.billing_address != 'undefined')) &&
                              ((typeof _SHIPPINNG.name != 'undefined') || (typeof _SHIPPINNG.shipping_name != 'undefined') || (typeof _SHIPPINNG.billing_name != 'undefined') || (typeof _SHIPPINNG.owner != 'undefined') || (typeof _SHIPPINNG.shipping_owner != 'undefined') || (typeof _SHIPPINNG.billing_owner != 'undefined'))
                            ){
                              const _SHIPPING_ADDRESS = _SHIPPINNG.address || _SHIPPINNG.shipping_address || _SHIPPINNG.billing_address,
                                    _SHIPPING_ADDRESS_OWNER = _SHIPPINNG.name || _SHIPPINNG.shipping_name || _SHIPPINNG.billing_name || _SHIPPINNG.owner || _SHIPPINNG.shipping_owner || _SHIPPINNG.billing_owner;

                              if (typeof _SHIPPING_ADDRESS.line1 != 'undefined'){
                                var _SHIPPINNG_SEED = {
                                  address: _SHIPPING_ADDRESS,
                                  name: _SHIPPING_ADDRESS_OWNER
                                };

                                if (typeof _SHIPPINNG_SEED.carrier != 'undefined'){
                                  _SHIPPINNG_SEED.carrier = _SHIPPINNG_SEED.carrier;
                                }

                                if (typeof _SHIPPINNG_SEED.tracking_number != 'undefined'){
                                  _SHIPPINNG_SEED.tracking_number = _SHIPPINNG_SEED.tracking_number;
                                }

                                if (typeof _SHIPPINNG_SEED.carrier != 'undefined'){
                                  _SHIPPINNG_SEED.carrier = _SHIPPINNG_SEED.carrier;
                                }

                                _CHARGE_SEED = {
                                  ..._CHARGE_SEED,
                                  shipping: _SHIPPINNG_SEED
                                };
                              }else{
                                _IS_TRANSACTION_READY_TO_LAUNCH = false;
                              }
                            }else{
                              _IS_TRANSACTION_READY_TO_LAUNCH = false;
                            }
                          }

                          if (_IS_TRANSACTION_READY_TO_LAUNCH){
                            Modules.Functions._chargeUsingToken(_CHARGE_SEED)
                            .then((charge) => {
                              if ((typeof charge.status != 'undefined') && (charge.status === "succeeded")){
                                const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                                      _COLLECTION = _DB.collection('histories');

                                var _TARGET = {
                                  end_user_id: _END_USER_ID,
                                  content: charge
                                };

                                if (typeof _THREAD.plan_id != 'undefined'){
                                  _TARGET.plan_id = new ObjectID(_THREAD.plan_id);
                                }

                                if (typeof _THREAD.wallet_id != 'undefined'){
                                  _TARGET.wallet_id = new ObjectID(_THREAD.wallet_id);

                                  const _DEPENDED_COLLECTION = _DB.collection('wallets');

                                  var _CHECKING_CRITERIA = {
                                    _id: _TARGET.wallet_id
                                  };

                                  _DEPENDED_COLLECTION.findOne(_CHECKING_CRITERIA, function(planFindQueryError, doc){
                                    if (planFindQueryError != null){
                                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The wallets collection find request could\'t be processed.`, 700);

                                      res.json(RECURSIVE_CONTENT);
                                    }else{
                                      const _WALLET = doc;

                                      _TARGET.previous_balance = parseInt(_WALLET.balance);
                                      _TARGET.new_balance = _TARGET.previous_balance + _BALANCE;

                                      _TARGET.created_at = _TODAY;
                                      _TARGET.modified_at = _TODAY;

                                      _COLLECTION.insertOne(_TARGET, function(logQueryError, historyDoc){
                                        if (logQueryError != null){
                                          const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection insert request could\'t be processed.`, 700);

                                          res.json(RECURSIVE_CONTENT);
                                        }else{
                                          if (historyDoc.insertedCount != 1){
                                            const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in ${_COLLECTION_NAME} collection could\'t be inserted.`, 700);

                                            res.json(RECURSIVE_CONTENT);
                                          }else{
                                            const _WALLET_TARGET = {
                                                    "$set": {
                                                      "modified_at": _TODAY,
                                                      "balance": _TARGET.new_balance
                                                    }
                                                  };

                                            const _WALLET_CRITERIA = {
                                              _id: _TARGET.wallet_id
                                            }

                                            _DEPENDED_COLLECTION.updateOne(_WALLET_CRITERIA, _WALLET_TARGET, function(updateQueryError, walletUpdatedoc){
                                              if (updateQueryError != null){
                                                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The wallet collection update request could\'t be processed.`, 700);

                                                res.json(RECURSIVE_CONTENT);
                                              }else{
                                                const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(historyDoc.ops[0]);

                                                res.json(RECURSIVE_CONTENT);

                                                client.close();
                                              }
                                            });
                                          }
                                        }
                                      });
                                    }
                                  });
                                }else {
                                  _COLLECTION.insertOne(_TARGET, function(logQueryError, historyDoc){
                                    if (logQueryError != null){
                                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection insert request could\'t be processed.`, 700);

                                      res.json(RECURSIVE_CONTENT);
                                    }else{
                                      if (historyDoc.insertedCount != 1){
                                        const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in ${_COLLECTION_NAME} collection could\'t be inserted.`, 700);

                                        res.json(RECURSIVE_CONTENT);
                                      }else{
                                        const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData({
                                          wallet: _WALLET,
                                          history: historyDoc.ops[0]
                                        });

                                        res.json(RECURSIVE_CONTENT);

                                        client.close();
                                      }
                                    }
                                  });
                                }
                              }else{
                                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(error);

                                res.json({
                                  ...RECURSIVE_CONTENT,
                                  data: charge
                                });
                              }
                            })
                            .catch((error) => {
                              let _ERROR = error,
                                  RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(error.message);

                              delete _ERROR.message;

                              res.json({
                                ...RECURSIVE_CONTENT,
                                ..._ERROR
                              });
                            });
                          }
                        }
                      }
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
                                "user.phone.mobile.content": new RegExp(`\.*${_TOKEN}\.*`, 'gi')
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
                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The authentication request could\'t be processed.`, 700);

                      res.json(RECURSIVE_CONTENT);
                    }else{
                      if (doc.length > 0){
                        const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc[0]);

                        res.json(RECURSIVE_CONTENT);

                        client.close();
                      }else{
                        const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`No matching were found.`, 700);

                        res.json(RECURSIVE_CONTENT);
                      }
                    }
                  });
                }else{
                  res.json(_LOCAL_FUNCTIONS._throwNewInstanceError('users'));
                }
                break;

              default:
                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

                res.json(RECURSIVE_CONTENT);
            }

            if (_IS_COLLECTION_READY_TO_ABSORB){
              _THREAD.modified_at = _THREAD.created_at = _TODAY;

              _COLLECTION.insertOne(_THREAD, function(insertQueryError, doc){
                if (insertQueryError != null){
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection insert request could\'t be processed.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  if (doc.insertedCount != 1){
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in ${_COLLECTION_NAME} collection could\'t be inserted.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc.ops[0]);

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
