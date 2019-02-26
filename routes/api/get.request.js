var crypto = require('crypto'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    ObjectID = require('mongodb').ObjectID;

const stripe = require('stripe')('sk_test_h88TQbVd5UPP4HGZdM2SQpbv');

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
  app.get('/:collection', (req, res) => {
    if (typeof req.params.collection != 'undefined'){
      const _COLLECTION_NAME = req.params.collection.toLowerCase();

      var _IS_COLLECTION_READY_TO_RESPONSE = false;

      MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
        if (connectionError != null){
            res.json(_LOCAL_FUNCTIONS._throwConnectionError());
          }else{
            var _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                _COLLECTION = _DB.collection(_COLLECTION_NAME),
                _CRITERIA = [];

            switch (_COLLECTION_NAME) {
              case 'endusers':
                _CRITERIA = [
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
                  }
                ];

                _COLLECTION.aggregate(_CRITERIA)
                .toArray(function(endUserFindQueryError, doc){
                  if (endUserFindQueryError != null){
                    const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = _Functions._throwResponseWithData(doc);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
                break;

              case 'test':
                // stripe.tokens.create({
                //   card: {
                //     number: '4242424242424242',
                //     exp_month: 12,
                //     exp_year: 2020,
                //     cvc: '123'
                //   }
                // }, function(err, token) {
                //    res.json(token);
                //
                // });

                // stripe.tokens.retrieve(
                //   "tok_1E85qcC02AvvjpzI3acnDGO9",
                //   function(err, token) {
                //     res.json(token)
                //   }
                // );

                // stripe.charges.create({
                //   amount: 2359900,
                //   currency: "usd",
                //   source: "tok_1E85qcC02AvvjpzI3acnDGO9",
                //   description: 'hello world',
                //   receipt_email: 'something@example.com',
                //   shipping: {
                //     name: 'John Doe',
                //     address: {
                //       line1: 'Address line 1',
                //       city: 'tehran',
                //       state: 'CA',
                //       postal_code: '19983',
                //       country: 'US'
                //     }
                //   }
                // }, function(err, charge) {
                //   // send response
                //   if (err){
                //       console.error(err);
                //       res.json({ error: err, charge: false });
                //   } else {
                //       // send response with charge data
                //       res.json({ error: false, charge: charge });
                //   }
                // })

                _Functions._chargeUsingToken({
                  card: {
                    number: '4242424242424242',
                    exp_month: 12,
                    exp_year: 2020,
                    cvc: '123'
                  },
                  amount: 2000,
                  currency: 'usd'
                })
                .then((charge) => {
                  res.json(charge)
                })
                break;

              case 'users':
              case 'usergroups':
              case 'wallets':
              case 'messages':
              case 'warehouses':
              case 'turnovers':
              case 'orders':
              case 'currencies':
              case 'taxonomies':
              case 'plans':
                _IS_COLLECTION_READY_TO_RESPONSE = true;
                break;

              default:
                const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

                res.json(RECURSIVE_CONTENT);
            }

            if (_IS_COLLECTION_READY_TO_RESPONSE){
              if (_CRITERIA.length === 0){
                _CRITERIA = {};
              }

              _COLLECTION.find(_CRITERIA)
              .sort({
                created_at: -1
              })
              .toArray(function(userFindQueryError, doc){
                if (userFindQueryError != null){
                  console.log(userFindQueryError)
                  const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

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

  app.get('/:collection/:token', (req, res) => {
    if (typeof req.params.collection != 'undefined'){
      const _COLLECTION_NAME = req.params.collection.toLowerCase(),
            _TOKEN = (_Functions._checkIsAValidObjectID(req.params.token) === true)? new ObjectID(req.params.token): req.params.token,
            _THREAD = req.query;

      var _IS_COLLECTION_READY_TO_RESPONSE = false;

      MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
        if (connectionError != null){
            res.json(_LOCAL_FUNCTIONS._throwConnectionError());
        }else{
          var _DB = client.db(CONNECTION_CONFIG.DB_NAME),
              _COLLECTION = _DB.collection(_COLLECTION_NAME),
              _CRITERIA = [];

          switch (_COLLECTION_NAME) {
            case 'endusers':
              _CRITERIA = [
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
                    "$or": [
                      {
                        "$and": [
                          {
                            "cardinal_id": {
                              "$exists": true
                            }
                          },
                          {
                            "cardinal_id": _TOKEN
                          }
                        ]
                      },
                      {
                        "$and": [
                          {
                            "_id": {
                              "$exists": true
                            }
                          },
                          {
                            "_id": _TOKEN
                          }
                        ]
                      }
                    ]
                  }
                }
              ];

              _COLLECTION.aggregate(_CRITERIA)
              .limit(1)
              .toArray(function(userFindQueryError, docs){
                if (userFindQueryError != null){
                  const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  const RECURSIVE_CONTENT = _Functions._throwResponseWithData(docs[0]);

                  res.json(RECURSIVE_CONTENT);

                  client.close();
                }
              });
              break;

            case 'users':
            case 'usergroups':
            case 'wallets':
            case 'messages':
            case 'warehouses':
            case 'turnovers':
            case 'orders':
            case 'currencies':
            case 'taxonomies':
              _IS_COLLECTION_READY_TO_RESPONSE = true;
              break;

            case 'plans':
              var _TARGET_MATCHING_CRITERIA = [
                {
                  "_id": _TOKEN
                },
                {
                  "taxonomy._id": _TOKEN
                }
              ];

              if (_Functions._checkIsAValidObjectID(req.params.token) !== true){
                var _TOKEN_KEYWORD = _Functions._convertTokenToKeyword(_TOKEN);

                if (_TOKEN_KEYWORD == 'TP' || _TOKEN_KEYWORD == 'T.P' || _TOKEN_KEYWORD == 'T.P.'){
                  _TOKEN_KEYWORD = 'TRANSACTION_POINT';
                }

                _TARGET_MATCHING_CRITERIA.push({
                  "taxonomy.value": _TOKEN_KEYWORD
                });
              }

              _CRITERIA = [
                {
                  "$lookup": {
                    "from": "taxonomies",
                    "localField": "taxonomy_id",
                    "foreignField": "_id",
                    "as": "taxonomy"
                  }
                },
                {
                  "$unwind": "$taxonomy"
                },
                {
                  "$project": {
                    "taxonomy_id": 0
                  }
                },
                {
                  "$match": {
                    "$or": _TARGET_MATCHING_CRITERIA
                  }
                }
              ];

              _COLLECTION.aggregate(_CRITERIA)
              .toArray(function(error, docs){
                if (error != null){
                  const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  const RECURSIVE_CONTENT = _Functions._throwResponseWithData(docs);

                  res.json(RECURSIVE_CONTENT);

                  client.close();
                }
              });
              break;

            case 'roles':
              _COLLECTION = _DB.collection('endusers');

              var _TOKENIZED_MATCH_CRITERIA = {
                    "$match": {
                      "$and": [
                        {
                          "cardinal_id": {
                            "$exists": true
                          }
                        },
                        {
                          "cardinal_id": _TOKEN
                        }
                      ]
                    }
                  };

              if ((typeof _THREAD.reference_ancestors != 'undefined') || (typeof _THREAD.references != 'undefined')){
                const _PREFERED_REFERENCE_TOKEN = _THREAD.reference_ancestors || _THREAD.references,
                      _FINAL_REFERENCE_ANCESTORS = _PREFERED_REFERENCE_TOKEN.split(",").map((ancestorID, i) => {
                        const _FINAL_ANCESTOR_ID = new ObjectID(ancestorID.trim());

                        return _FINAL_ANCESTOR_ID;
                      });

                _TOKENIZED_MATCH_CRITERIA["$match"]["$and"].push({
                  "cardinal_ancestors": {
                    "$all": _FINAL_REFERENCE_ANCESTORS
                  }
                });
              }

              if ((typeof _THREAD.reference_id != 'undefined') || (typeof _THREAD.reference != 'undefined')){
                const _PREFERED_REFERENCE_TOKEN = _THREAD.reference_id || _THREAD.reference,
                      _FINAL_PREFERED_REFERENCE_TOKEN = new ObjectID(_PREFERED_REFERENCE_TOKEN);

                _TOKENIZED_MATCH_CRITERIA["$match"]["$and"].push({
                  "reference_id": _FINAL_PREFERED_REFERENCE_TOKEN
                });
              }

              if ((typeof _THREAD.user_group_ancestors != 'undefined') || (typeof _THREAD.usergroup_ancestors != 'undefined') || (typeof _THREAD.usergroupAncestors != 'undefined') || (typeof _THREAD.userGroupAncestors != 'undefined') || (typeof _THREAD.userGroupAncestors != 'undefined')){
                const _PREFERED_USER_GROUP_TOKEN = _THREAD.user_group_ancestors || _THREAD.usergroup_ancestors || _THREAD.usergroupAncestors || _THREAD.userGroupAncestors || _THREAD.userGroupAncestors,
                      _FINAL_USER_GROUP_ANCESTORS = _PREFERED_USER_GROUP_TOKEN.split(",").map((ancestorID, i) => {
                        const _FINAL_ANCESTOR_ID = new ObjectID(ancestorID.trim());

                        return _FINAL_ANCESTOR_ID;
                      });

                _TOKENIZED_MATCH_CRITERIA["$match"]["$and"].push({
                  "usergroup.cardinal_ancestors": {
                    "$all": _FINAL_USER_GROUP_ANCESTORS
                  }
                });
              }

              if ((typeof _THREAD.user_group_id != 'undefined') || (typeof _THREAD.usergroup_id != 'undefined') || (typeof _THREAD.usergroupId != 'undefined') || (typeof _THREAD.usergroupID != 'undefined') || (typeof _THREAD.userGroupID != 'undefined') || (typeof _THREAD.userGroupId != 'undefined')){
                const _PREFERED_USER_GROUP_TOKEN = _THREAD.user_group_id || _THREAD.usergroup_id || _THREAD.usergroupId || _THREAD.usergroupID || _THREAD.userGroupID || _THREAD.userGroupId,
                      _FINAL_PREFERED_USER_GROUP_TOKEN = new ObjectID(_PREFERED_USER_GROUP_TOKEN);

                _TOKENIZED_MATCH_CRITERIA["$match"]["$and"].push({
                  "usergroup._id": _FINAL_PREFERED_USER_GROUP_TOKEN
                });
              }

              _CRITERIA = [
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
                    _TOKENIZED_MATCH_CRITERIA
                ];

                _COLLECTION.aggregate(_CRITERIA)
                .toArray(function(userFindQueryError, docs){
                  if (userFindQueryError != null){
                    const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The endusers collection find request could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = _Functions._throwResponseWithData(docs);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
              break;

            default:
              const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

              res.json(RECURSIVE_CONTENT);
              break;
          }

          if (_IS_COLLECTION_READY_TO_RESPONSE){
            _CRITERIA = {
              _id: _TOKEN
            };

            _COLLECTION.findOne(_CRITERIA, function(userFindQueryError, doc){
              if (userFindQueryError != null){
                const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

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

  app.get('/usergroups/type/:token', (req, res) => {
    const _TOKEN = req.params.token,
          _THREAD = req.query;

    MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
      if (connectionError != null){
          res.json(_LOCAL_FUNCTIONS._throwConnectionError());
        }else{
          const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                _COLLECTION = _DB.collection('usergroups');

          var _CRITERIA = {
                type: _Functions._convertTokenToKeyword(_TOKEN)
              };

          if ((typeof _THREAD.token != 'undefined') || (typeof _THREAD._id != 'undefined') || (typeof _THREAD.id != 'undefined') || (typeof _THREAD.ID != 'undefined')){
            const _ANCESTORS = _THREAD.token || _THREAD._id || _THREAD.id || _THREAD.ID,
                  _FINAL_ANCESTORS = _ANCESTORS.split(",").map((ancestorID, i) => {
                    const _FINAL_ANCESTOR_ID = new ObjectID(ancestorID.trim());

                    return _FINAL_ANCESTOR_ID;
                  });

            _CRITERIA.cardinal_ancestors = {
              "$all": _FINAL_ANCESTORS
            };
          }

          _COLLECTION.find(_CRITERIA)
          .sort({
            priority: 1
          })
          .toArray(function(userFindQueryError, doc){
            if (userFindQueryError != null){
              const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The usergroups collection find request could\'t be processed.`, 700);

              res.json(RECURSIVE_CONTENT);
            }else{
              const RECURSIVE_CONTENT = _Functions._throwResponseWithData(doc);

              res.json(RECURSIVE_CONTENT);

              client.close();
            }
          });
        }
    });
  });

  app.get('/usergroups/type/:token/:head', (req, res) => {
    const _TOKEN = req.params.token,
          _HEAD = req.params.head;

    if (_HEAD != ''){
      const _HEAD_KEYWORD = _Functions._convertTokenToKeyword(_HEAD);

      switch (_HEAD_KEYWORD) {
        case 'HEAD':
        case 'MASTER':
        case 'HEAD_MASTER':
        case 'TOP':
        case 'HIGHEST':
        case 'HIGHEST_PRIORITY':
          MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
            if (connectionError != null){
                res.json(_LOCAL_FUNCTIONS._throwConnectionError());
              }else{
                const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                      _COLLECTION = _DB.collection('usergroups');

                var _CRITERIA = {
                      type: _Functions._convertTokenToKeyword(_TOKEN),
                      reference_id: {
                        "$exists": false
                      }
                    };

                _COLLECTION.findOne(_CRITERIA, function(userFindQueryError, doc){
                  if (userFindQueryError != null){
                    const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The usergroups collection find request could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = _Functions._throwResponseWithData(doc);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
              }
          });
          break;
        default:
          const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`You should choose the user level type.`, 700);

          res.json(RECURSIVE_CONTENT);
          break;
      }
    }
  });

  app.get('/role/brand/:brand_name/:token', (req, res) => {
    const _BRAND_NAME = req.params.brand_name,
          _TOKEN = req.params.token;

    MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
      if (connectionError != null){
          res.json(_LOCAL_FUNCTIONS._throwConnectionError());
        }else{
          const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                _COLLECTION = _DB.collection('endusers');

          var _CRITERIA = {
                "brand.name": _Functions._convertKeywordToToken(_BRAND_NAME)
              };

          _COLLECTION.findOne(_CRITERIA, function(userFindQueryError, doc){
            if (userFindQueryError != null){
              const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The endusers collection find request could\'t be processed.`, 700);

              res.json(RECURSIVE_CONTENT);
            }else{
              if (doc !== null){
                var _ROLE_CRITERIA = [
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
                          "cardinal_id": new ObjectID(doc._id)
                        },
                        {
                          "user.email.validation.token": _TOKEN
                        }
                      ]
                    }
                  },
                  {
                    "$limit": 1
                  }
                ];

                _COLLECTION.aggregate(_ROLE_CRITERIA)
                .toArray(function(roleCheckQueryError, roleCheckDoc){
                  if (roleCheckQueryError != null){
                    const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`Matching Role\'s token operation could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = _Functions._throwResponseWithData(((roleCheckDoc.length > 0)? roleCheckDoc[0]: {}));

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
              }else{
                const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`We couldn\'t find any brand with name ${_Functions._convertKeywordToToken(_BRAND_NAME)}.`, 700);

                res.json(RECURSIVE_CONTENT);
              }
            }
          });
        }
    });
  });
};
