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
  app.get(`${Modules.Functions._getEndpointOfAPI()}/:collection`, (req, res) => {
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
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
                break;

              case 'products':
                _CRITERIA = [
                  {
                    "$lookup": {
                      "from": "taxonomies",
                      "localField": "category_id",
                      "foreignField": "_id",
                      "as": "category"
                    }
                  },
                  {
                    "$unwind": {
                      "path": "$category",
                      "preserveNullAndEmptyArrays": true
                    }
                  },
                  {
                    "$match": {
                      "category.key": "PRODUCT_CATEGORY"
                    }
                  },
                  {
                    "$addFields": {
                      "category.key": {
                        "$ifNull": [ "$category.cumulative_value", "$category.value" ]
                      }
                    }
                  },
                  {
                    "$project": {
                      "category_id": 0,
                      "category.value": 0,
                      "category.features": 0,
                      "category.cumulative_value": 0
                    }
                  }
                ];

                _COLLECTION.aggregate(_CRITERIA)
                .toArray(function(productFindQueryError, doc){
                  if (productFindQueryError != null){
                    console.log(productFindQueryError)
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
                break;

              case 'fragments':
                _CRITERIA = [
                  {
                    "$lookup": {
                      "from": "products",
                      "localField": "product_id",
                      "foreignField": "_id",
                      "as": "product"
                    }
                  },
                  {
                    "$unwind": {
                      "path": "$product",
                      "preserveNullAndEmptyArrays": true
                    }
                  },
                  {
                    "$lookup": {
                      "from": "taxonomies",
                      "localField": "product.category_id",
                      "foreignField": "_id",
                      "as": "product.category"
                    }
                  },
                  {
                    "$unwind": {
                      "path": "$product.category",
                      "preserveNullAndEmptyArrays": true
                    }
                  },
                  {
                    "$project": {
                      "product_id": 0,
                      "product.category_id": 0
                    }
                  },
                  {
                    "$match": {
                      "product.category.key": "PRODUCT_CATEGORY",
                      "product.verified": true
                    }
                  },
                  {
                    "$addFields": {
                      "product.category.key": {
                        "$ifNull": [ "$product.category.cumulative_value", "$product.category.value" ]
                      },
                      "features": {
                        "$concatArrays": [
                          {
                            "$ifNull": [
                              {
                                "$map": {
                                  "input": "$features",
                                  "as": "feature",
                                  "in": {
                                    "$mergeObjects": [
                                      "$$feature",
                                      {
                                        "parent": "FRAGMENT"
                                      }
                                    ]
                                  }
                                }
                              },
                              []
                            ]
                          },
                          {
                            "$ifNull": [
                              {
                                "$map": {
                                  "input": "$product.features",
                                  "as": "feature",
                                  "in": {
                                    "$mergeObjects": [
                                      "$$feature",
                                      {
                                        "parent": "PRODUCT"
                                      }
                                    ]
                                  }
                                }
                              },
                              []
                            ]
                          }
                        ]
                      }
                    }
                  },
                  {
                    "$project": {
                      "product_id": 0,
                      "product.category_id": 0,
                      "product.category.value": 0,
                      "product.category.cumulative_value": 0,
                      "product.features": 0,
                      "product.created_at": 0,
                      "product.modified_at": 0,
                      "product.verified": 0
                    }
                  }
                ];

                _COLLECTION.aggregate(_CRITERIA)
                .toArray(function(endUserFindQueryError, doc){
                  if (endUserFindQueryError != null){
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
                break;

              case 'wallets':
                _CRITERIA = [
                  {
                    "$lookup": {
                      "from": "histories",
                      "localField": "_id",
                      "foreignField": "wallet_id",
                      "as": "histories"
                    }
                  },
                  {
                    "$unwind": {
                      "path": "$histories",
                      "preserveNullAndEmptyArrays": true
                    }
                  },
                  {
                    "$project": {
                      "_id": 1,
                      "end_user_id": 1,
                      "currency_id": 1,
                      "name": 1,
                      "balance": 1,
                      "transactions_deposit": { "$cond": [{ "$gt": [ "$histories.new_balance", "$histories.previous_balance"] }, { "$subtract": ["$histories.new_balance", "$histories.previous_balance"] }, 0] },
                      "transactions_withdraw": { "$cond": [{ "$lt": [ "$histories.new_balance", "$histories.previous_balance"] }, { "$subtract": ["$histories.previous_balance", "$histories.new_balance"] }, 0] },
                      "modified_at": 1,
                      "created_at": 1
                    }
                  },
                  {
                    "$group": {
                      "_id": {
                        "_id": "$_id",
                        "end_user_id": "$end_user_id",
                        "currency_id": "$currency_id",
                        "name": "$name",
                        "balance": "$balance",
                        "modified_at": "$modified_at",
                        "created_at": "$created_at",
                      },
                      "transactions_amount": { "$sum": 1 },
                      "transactions_deposit": { "$sum": "$transactions_deposit" },
                      "transactions_withdraw": { "$sum": "$transactions_withdraw" }
                    }
                  },
                  {
                    "$replaceRoot": { "newRoot": { "$mergeObjects": [ "$_id", "$$ROOT" ] } }
                  },
                  {
                    "$project": {
                      "_id": "$_id._id",
                      "end_user_id": 1,
                      "currency_id": 1,
                      "name": 1,
                      "balance": 1,
                      "transactions": {
                        "amount": "$transactions_amount",
                        "deposit": "$transactions_deposit",
                        "withdraw": "$transactions_withdraw"
                      },
                      "modified_at": 1,
                      "created_at": 1
                    }
                  },
                  {
                    "$lookup": {
                      "from": "endusers",
                      "localField": "end_user_id",
                      "foreignField": "_id",
                      "as": "enduser"
                    }
                  },
                  {
                    "$unwind": "$enduser"
                  },
                  {
                    "$lookup": {
                      "from": "currencies",
                      "localField": "currency_id",
                      "foreignField": "_id",
                      "as": "currency"
                    }
                  },
                  {
                    "$unwind": "$currency"
                  },
                  {
                    "$lookup": {
                      "from": "users",
                      "localField": "enduser.user_id",
                      "foreignField": "_id",
                      "as": "enduser.user"
                    }
                  },
                  {
                    "$unwind": {
                      "path": "$enduser.user",
                      "preserveNullAndEmptyArrays": true
                    }
                  },
                  {
                    "$lookup": {
                      "from": "usergroups",
                      "localField": "enduser.user_group_id",
                      "foreignField": "_id",
                      "as": "enduser.usergroup"
                    }
                  },
                  {
                    "$unwind": "$enduser.usergroup"
                  },
                  {
                    "$project": {
                      "end_user_id": 0,
                      "currency_id": 0,
                      "enduser.user_id": 0,
                      "enduser.user_group_id": 0
                    }
                  }
                ];

                _COLLECTION.aggregate(_CRITERIA)
                .sort({
                  created_at: -1
                })
                .toArray(function(walletFindQueryError, doc){
                  if (walletFindQueryError != null){
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
                break;

              case 'histories':
                _CRITERIA = [
                  {
                    "$lookup": {
                      "from": "endusers",
                      "localField": "end_user_id",
                      "foreignField": "_id",
                      "as": "enduser"
                    }
                  },
                  {
                    "$unwind": "$enduser"
                  },
                  {
                    "$lookup": {
                      "from": "wallets",
                      "localField": "wallet_id",
                      "foreignField": "_id",
                      "as": "wallet"
                    }
                  },
                  {
                    "$unwind": {
                      "path": "$wallet",
                      "preserveNullAndEmptyArrays": true
                    }
                  },
                  {
                    "$lookup": {
                      "from": "plans",
                      "localField": "plan_id",
                      "foreignField": "_id",
                      "as": "plan"
                    }
                  },
                  {
                    "$unwind": {
                      "path": "$plan",
                      "preserveNullAndEmptyArrays": true
                    }
                  },
                  {
                    "$lookup": {
                      "from": "users",
                      "localField": "enduser.user_id",
                      "foreignField": "_id",
                      "as": "enduser.user"
                    }
                  },
                  {
                    "$unwind": {
                      "path": "$enduser.user",
                      "preserveNullAndEmptyArrays": true
                    }
                  },
                  {
                    "$lookup": {
                      "from": "usergroups",
                      "localField": "enduser.user_group_id",
                      "foreignField": "_id",
                      "as": "enduser.usergroup"
                    }
                  },
                  {
                    "$unwind": "$enduser.usergroup"
                  },
                  {
                    "$project": {
                      "end_user_id": 0,
                      "wallet_id": 0,
                      "plan_id": 0,
                      "enduser.user_id": 0,
                      "enduser.user_group_id": 0
                    }
                  }
                ];

                _COLLECTION.aggregate(_CRITERIA)
                .sort({
                  created_at: -1
                })
                .toArray(function(error, docs){
                  if (error != null){
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(docs);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
                break;

              case 'warehouses':
                _CRITERIA = [
                  {
                    "$lookup": {
                      "from": "fragments",
                      "localField": "_id",
                      "foreignField": "warehouse_id",
                      "as": "product"
                    }
                  },
                  {
                    "$project": {
                      "_id": 1,
                      "end_user_id": 1,
                      "name": 1,
                      "modified_at": 1,
                      "created_at": 1,
                      "products.count": {
                        "$size": "$product"
                      }
                    }
                  },
                  {
                    "$lookup": {
                      "from": "endusers",
                      "localField": "end_user_id",
                      "foreignField": "_id",
                      "as": "enduser"
                    }
                  },
                  {
                    "$unwind": "$enduser"
                  },
                  {
                    "$lookup": {
                      "from": "users",
                      "localField": "enduser.user_id",
                      "foreignField": "_id",
                      "as": "enduser.user"
                    }
                  },
                  {
                    "$unwind": {
                      "path": "$enduser.user",
                      "preserveNullAndEmptyArrays": true
                    }
                  },
                  {
                    "$lookup": {
                      "from": "usergroups",
                      "localField": "enduser.user_group_id",
                      "foreignField": "_id",
                      "as": "enduser.usergroup"
                    }
                  },
                  {
                    "$unwind": "$enduser.usergroup"
                  },
                  {
                    "$project": {
                      "end_user_id": 0,
                      "enduser.user_id": 0,
                      "enduser.user_group_id": 0
                    }
                  }
                ];

                _COLLECTION.aggregate(_CRITERIA)
                .sort({
                  created_at: -1
                })
                .toArray(function(walletFindQueryError, doc){
                  if (walletFindQueryError != null){
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
                break;

              case 'users':
              case 'usergroups':
              case 'messages':
              case 'turnovers':
              case 'orders':
              case 'currencies':
              case 'taxonomies':
              case 'plans':
                _IS_COLLECTION_READY_TO_RESPONSE = true;
                break;

              default:
                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

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
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

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

  app.get(`${Modules.Functions._getEndpointOfAPI()}/:collection/:token`, (req, res) => {
    if (typeof req.params.collection != 'undefined'){
      const _COLLECTION_NAME = req.params.collection.toLowerCase(),
            _TOKEN = (Modules.Functions._checkIsAValidObjectID(req.params.token) === true)? new ObjectID(req.params.token): req.params.token,
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
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(docs[0]);

                  res.json(RECURSIVE_CONTENT);

                  client.close();
                }
              });
              break;

            case 'users':
            case 'usergroups':
            case 'messages':
            case 'turnovers':
            case 'orders':
            case 'currencies':
              _IS_COLLECTION_READY_TO_RESPONSE = true;
              break;

            case 'taxonomies':
              _CRITERIA = [
                {
                  "$match": {
                    "_id": _TOKEN
                  }
                }
              ];

              let _MATCHING_CRITERIA = {},
                  _NORMAL_PROJECTION = {
                    "created_at": 1,
                    "modified_at": 1
                  };

              if (Modules.Functions._checkIsAValidObjectID(req.params.token) !== true){
                var _TOKEN_KEYWORD = Modules.Functions._convertTokenToKeyword(_TOKEN);

                switch (_TOKEN_KEYWORD) {
                  case 'PC':
                  case 'P.C':
                  case 'P.C.':
                    _NORMAL_PROJECTION["ancestors"] = 1;
                    _NORMAL_PROJECTION["key"] = "$value";
                    _NORMAL_PROJECTION["features"] = 1;
                    _NORMAL_PROJECTION["cumulative_key"] = "$cumulative_value";

                    _TOKEN_KEYWORD = 'PRODUCT_CATEGORY';

                    _MATCHING_CRITERIA['$and'] = [
                      {
                        "key": _TOKEN_KEYWORD
                      }
                    ];

                    if ((typeof _THREAD.depth != 'undefined') && (!isNaN(_THREAD.depth))){
                      let _ANCESTORS_CRITERIA = {
                        "ancestors": {
                          "$exists": false
                        }
                      };

                      if (_THREAD.depth > 0){
                        _ANCESTORS_CRITERIA = {
                          "ancestors": {
                            "$size": parseInt(_THREAD.depth)
                          }
                        }
                      }

                      _MATCHING_CRITERIA['$and'].push(_ANCESTORS_CRITERIA);

                      if (typeof _THREAD.ancestors != 'undefined'){
                        const _PREFERED_REFERENCE_TOKEN = _THREAD.ancestors,
                              _FINAL_REFERENCE_ANCESTORS = _PREFERED_REFERENCE_TOKEN.split(",").map((ancestorID, i) => {
                                const _FINAL_ANCESTOR_ID = new ObjectID(ancestorID.trim());

                                return _FINAL_ANCESTOR_ID;
                              });

                        _MATCHING_CRITERIA['$and'].push({
                          "ancestors": {
                            "$all": _FINAL_REFERENCE_ANCESTORS
                          }
                        });
                      }
                    }
                    break;

                  case 'PF':
                  case 'P.F':
                  case 'P.F.':
                    _NORMAL_PROJECTION["key"] = "$value";
                    _TOKEN_KEYWORD = 'PRODUCT_FEATURE';
                    _MATCHING_CRITERIA.key = _TOKEN_KEYWORD;
                    break;

                  case 'PSH':
                  case 'P.S.H':
                  case 'P.F.H.':
                    _TOKEN_KEYWORD = 'PRODUCT_SHIPPING_METHOD';
                    _MATCHING_CRITERIA.key = _TOKEN_KEYWORD;
                    _NORMAL_PROJECTION["key"] = 1;
                    _NORMAL_PROJECTION["value"] = 1;
                    break;

                  case 'UNIT':
                    _TOKEN_KEYWORD = 'UNIT';
                    _MATCHING_CRITERIA.key = _TOKEN_KEYWORD;
                    _NORMAL_PROJECTION["key"] = "$value";
                    break;
                }

                _CRITERIA = [
                  {
                    "$match": _MATCHING_CRITERIA
                  },
                  {
                    "$project": _NORMAL_PROJECTION
                  }
                ];
              }

              _COLLECTION.aggregate(_CRITERIA)
              .toArray(function(error, docs){
                if (error != null){
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  var _RESPONSE = [];

                  if (docs.length > 0){
                    if (docs[0]._id == req.params.token){
                      _RESPONSE = docs[0];
                    }else{
                      _RESPONSE = docs;
                    }
                  }

                  const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(_RESPONSE);

                  res.json(RECURSIVE_CONTENT);

                  client.close();
                }
              });
              break;

            case 'histories':
              var _TARGET_MATCHING_CRITERIA = [
                {
                  "_id": _TOKEN
                },
                {
                  "wallet._id": _TOKEN
                },
                {
                  "enduser._id": _TOKEN
                },
                {
                  "enduser.cardinal_id": _TOKEN
                },
                {
                  "enduser.reference_id": _TOKEN
                }
              ];

              _CRITERIA = [
                {
                  "$lookup": {
                    "from": "endusers",
                    "localField": "end_user_id",
                    "foreignField": "_id",
                    "as": "enduser"
                  }
                },
                {
                  "$unwind": "$enduser"
                },
                {
                  "$lookup": {
                    "from": "wallets",
                    "localField": "wallet_id",
                    "foreignField": "_id",
                    "as": "wallet"
                  }
                },
                {
                  "$unwind": {
                    "path": "$wallet",
                    "preserveNullAndEmptyArrays": true
                  }
                },
                {
                  "$lookup": {
                    "from": "plans",
                    "localField": "plan_id",
                    "foreignField": "_id",
                    "as": "plan"
                  }
                },
                {
                  "$unwind": {
                    "path": "$plan",
                    "preserveNullAndEmptyArrays": true
                  }
                },
                {
                  "$lookup": {
                    "from": "users",
                    "localField": "enduser.user_id",
                    "foreignField": "_id",
                    "as": "enduser.user"
                  }
                },
                {
                  "$unwind": {
                    "path": "$enduser.user",
                    "preserveNullAndEmptyArrays": true
                  }
                },
                {
                  "$lookup": {
                    "from": "usergroups",
                    "localField": "enduser.user_group_id",
                    "foreignField": "_id",
                    "as": "enduser.usergroup"
                  }
                },
                {
                  "$unwind": "$enduser.usergroup"
                },
                {
                  "$project": {
                    "end_user_id": 0,
                    "wallet_id": 0,
                    "plan_id": 0,
                    "enduser.user_id": 0,
                    "enduser.user_group_id": 0
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
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  var _RESPONSE = [];

                  if (docs.length > 0){
                    if (docs[0]._id == req.params.token){
                      _RESPONSE = docs[0];
                    }else{
                      _RESPONSE = docs;
                    }
                  }

                  const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(_RESPONSE);

                  res.json(RECURSIVE_CONTENT);

                  client.close();
                }
              });
              break;

            case 'wallets':
              _CRITERIA = [
                {
                  "$lookup": {
                    "from": "histories",
                    "localField": "_id",
                    "foreignField": "wallet_id",
                    "as": "histories"
                  }
                },
                {
                  "$unwind": "$histories"
                },
                {
                  "$project": {
                    "_id": 1,
                    "end_user_id": 1,
                    "currency_id": 1,
                    "name": 1,
                    "balance": 1,
                    "transactions_deposit": { "$cond": [{ "$gt": [ "$histories.new_balance", "$histories.previous_balance"] }, { "$subtract": ["$histories.new_balance", "$histories.previous_balance"] }, 0] },
                    "transactions_withdraw": { "$cond": [{ "$lt": [ "$histories.new_balance", "$histories.previous_balance"] }, { "$subtract": ["$histories.previous_balance", "$histories.new_balance"] }, 0] },
                    "modified_at": 1,
                    "created_at": 1
                  }
                },
                {
                  "$group": {
                    "_id": {
                      "_id": "$_id",
                      "end_user_id": "$end_user_id",
                      "currency_id": "$currency_id",
                      "name": "$name",
                      "balance": "$balance",
                      "modified_at": "$modified_at",
                      "created_at": "$created_at",
                    },
                    "transactions_amount": { "$sum": 1 },
                    "transactions_deposit": { "$sum": "$transactions_deposit" },
                    "transactions_withdraw": { "$sum": "$transactions_withdraw" }
                  }
                },
                {
                  "$replaceRoot": { "newRoot": { "$mergeObjects": [ "$_id", "$$ROOT" ] } }
                },
                {
                  "$project": {
                    "_id": "$_id._id",
                    "end_user_id": 1,
                    "currency_id": 1,
                    "name": 1,
                    "balance": 1,
                    "transactions": {
                      "amount": "$transactions_amount",
                      "deposit": "$transactions_deposit",
                      "withdraw": "$transactions_withdraw"
                    },
                    "modified_at": 1,
                    "created_at": 1
                  }
                },
                {
                  "$lookup": {
                    "from": "endusers",
                    "localField": "end_user_id",
                    "foreignField": "_id",
                    "as": "enduser"
                  }
                },
                {
                  "$unwind": "$enduser"
                },
                {
                  "$lookup": {
                    "from": "currencies",
                    "localField": "currency_id",
                    "foreignField": "_id",
                    "as": "currency"
                  }
                },
                {
                  "$unwind": "$currency"
                },
                {
                  "$lookup": {
                    "from": "users",
                    "localField": "enduser.user_id",
                    "foreignField": "_id",
                    "as": "enduser.user"
                  }
                },
                {
                  "$unwind": {
                    "path": "$enduser.user",
                    "preserveNullAndEmptyArrays": true
                  }
                },
                {
                  "$lookup": {
                    "from": "usergroups",
                    "localField": "enduser.user_group_id",
                    "foreignField": "_id",
                    "as": "enduser.usergroup"
                  }
                },
                {
                  "$unwind": "$enduser.usergroup"
                },
                {
                  "$project": {
                    "end_user_id": 0,
                    "currency_id": 0,
                    "enduser.user_id": 0,
                    "enduser.user_group_id": 0
                  }
                }
              ];

              if ((typeof _THREAD.currency_id != 'undefined') || (typeof _THREAD.currency != 'undefined') || (typeof _THREAD.currency_type != 'undefined')){
                const _CURRENCY = _THREAD.currency_id || _THREAD.currency || _THREAD.currency_type;

                var _TOKENIZED_MATCH_CRITERIA = {};

                if (Modules.Functions._checkIsAValidObjectID(_CURRENCY) === true){
                  _TOKENIZED_MATCH_CRITERIA["currency._id"] = new ObjectID(_CURRENCY);
                }else{
                  var _TOKEN_KEYWORD = Modules.Functions._convertTokenToKeyword(_CURRENCY);

                  if (_TOKEN_KEYWORD == 'TP' || _TOKEN_KEYWORD == 'T.P' || _TOKEN_KEYWORD == 'T.P.'){
                    _TOKEN_KEYWORD = 'TRANSACTION_POINT';
                  }

                  _TOKENIZED_MATCH_CRITERIA["currency.type"] = _TOKEN_KEYWORD;
                }

                _CRITERIA = [
                  ..._CRITERIA,
                  {
                    "$match": {
                      "$and": [
                        {
                          "enduser._id": _TOKEN
                        },
                        _TOKENIZED_MATCH_CRITERIA
                      ]
                    }
                  }
                ];
              }else{
                _CRITERIA = [
                  ..._CRITERIA,
                  {
                    "$match": {
                      "$or": [
                        {
                          "_id": _TOKEN
                        },
                        {
                          "enduser._id": _TOKEN
                        },
                        {
                          "enduser.cardinal_id": _TOKEN
                        },
                        {
                          "enduser.reference_id": _TOKEN
                        }
                      ]
                    }
                  },
                  {
                    "$limit": 1
                  }
                ];
              }

              _COLLECTION.aggregate(_CRITERIA)
              .toArray(function(walletFindQueryError, docs){
                if (walletFindQueryError != null){
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  if ((typeof _THREAD.currency_id != 'undefined') || (typeof _THREAD.currency != 'undefined') || (typeof _THREAD.currency_type != 'undefined')){
                    res.json(Modules.Functions._throwResponseWithData(docs));
                  }else{
                    res.json(Modules.Functions._throwResponseWithData(docs[0]));
                  }

                  client.close();
                }
              });
              break;

            case 'overall':
              let WALLETS_COLLECTION = _DB.collection('wallets'),
                  WALLETS_CRITERIA = [
                    {
                      "$match": {
                        "end_user_id": _TOKEN
                      }
                    },
                    {
                      "$group": {
                        "_id": "$end_user_id",
                        "count": { "$sum": 1 }
                      }
                    },
                    {
                      "$project": {
                        "_id": 0
                      }
                    },
                    {
                      "$limit": 1
                    }
                  ];

              WALLETS_COLLECTION.aggregate(WALLETS_CRITERIA)
              .toArray(function(walletsFindQueryError, walletsDocs){
                if (walletsFindQueryError != null){
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The wallets collection find request could\'t be processed.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  let ROLES_COLLECTION = _DB.collection('endusers'),
                      ROLES_CRITERIA = [
                        {
                          "$match": {
                            "cardinal_id": _TOKEN
                          }
                        },
                        {
                          "$group": {
                            "_id": "$cardinal_id",
                            "count": { "$sum": 1 }
                          }
                        },
                        {
                          "$project": {
                            "_id": 0
                          }
                        },
                        {
                          "$limit": 1
                        }
                      ];

                  ROLES_COLLECTION.aggregate(ROLES_CRITERIA)
                  .toArray(function(rolesFindQueryError, rolesDocs){
                    if (rolesFindQueryError != null){
                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The roles collection find request could\'t be processed.`, 700);

                      res.json(RECURSIVE_CONTENT);
                    }else{
                      res.json(Modules.Functions._throwResponseWithData({
                        wallets: walletsDocs[0],
                        roles: rolesDocs[0]
                      }));

                      client.close();
                    }
                  });

                  client.close();
                }
              });
              break;

            case 'warehouses':
              var _TARGET_MATCHING_CRITERIA = [
                {
                  "_id": _TOKEN
                },
                {
                  "enduser._id": _TOKEN
                }
              ];

              _CRITERIA = [
                {
                  "$lookup": {
                    "from": "fragments",
                    "localField": "_id",
                    "foreignField": "warehouse_id",
                    "as": "product"
                  }
                },
                {
                  "$project": {
                    "_id": 1,
                    "end_user_id": 1,
                    "name": 1,
                    "modified_at": 1,
                    "created_at": 1,
                    "products.count": {
                      "$size": "$product"
                    }
                  }
                },
                {
                  "$lookup": {
                    "from": "endusers",
                    "localField": "end_user_id",
                    "foreignField": "_id",
                    "as": "enduser"
                  }
                },
                {
                  "$unwind": "$enduser"
                },
                {
                  "$lookup": {
                    "from": "users",
                    "localField": "enduser.user_id",
                    "foreignField": "_id",
                    "as": "enduser.user"
                  }
                },
                {
                  "$unwind": {
                    "path": "$enduser.user",
                    "preserveNullAndEmptyArrays": true
                  }
                },
                {
                  "$lookup": {
                    "from": "usergroups",
                    "localField": "enduser.user_group_id",
                    "foreignField": "_id",
                    "as": "enduser.usergroup"
                  }
                },
                {
                  "$unwind": "$enduser.usergroup"
                },
                {
                  "$project": {
                    "end_user_id": 0,
                    "enduser.user_id": 0,
                    "enduser.user_group_id": 0
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
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  var _RESPONSE = [];

                  if (docs.length > 0){
                    if (docs[0]._id == req.params.token){
                      _RESPONSE = docs[0];
                    }else{
                      _RESPONSE = docs;
                    }
                  }

                  const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(_RESPONSE);

                  res.json(RECURSIVE_CONTENT);

                  client.close();
                }
              });
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

              if (Modules.Functions._checkIsAValidObjectID(req.params.token) !== true){
                var _TOKEN_KEYWORD = Modules.Functions._convertTokenToKeyword(_TOKEN);

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
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  var _RESPONSE = [];

                  if (docs.length > 0){
                    if (docs[0]._id == req.params.token){
                      _RESPONSE = docs[0];
                    }else{
                      _RESPONSE = docs;
                    }
                  }

                  const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(_RESPONSE);

                  res.json(RECURSIVE_CONTENT);

                  client.close();
                }
              });
              break;

            case 'products':
              if (Modules.Functions._checkIsAValidObjectID(req.params.token) === true){
                var _TARGET_MATCHING_CRITERIA = [
                  {
                    "_id": _TOKEN
                  },
                  {
                    "category._id": _TOKEN
                  }
                ];

                _CRITERIA = [
                  {
                    "$lookup": {
                      "from": "taxonomies",
                      "localField": "category_id",
                      "foreignField": "_id",
                      "as": "category"
                    }
                  },
                  {
                    "$unwind": {
                      "path": "$category",
                      "preserveNullAndEmptyArrays": true
                    }
                  },
                  {
                    "$match": {
                      "$and": [
                        {
                          "category.key": "PRODUCT_CATEGORY"
                        },
                        {
                          "$or": _TARGET_MATCHING_CRITERIA
                        }
                      ]
                    }
                  },
                  {
                    "$addFields": {
                      "category.key": {
                        "$ifNull": [ "$category.cumulative_value", "$category.value" ]
                      }
                    }
                  },
                  {
                    "$project": {
                      "category_id": 0,
                      "category.value": 0,
                      "category.features": 0,
                      "category.cumulative_value": 0
                    }
                  }
                ];

                _COLLECTION.aggregate(_CRITERIA)
                .toArray(function(error, docs){
                  if (error != null){
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    var _RESPONSE = [];

                    if (docs.length > 0){
                      if (docs[0]._id == req.params.token){
                        _RESPONSE = docs[0];
                      }else{
                        _RESPONSE = docs;
                      }
                    }

                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(_RESPONSE);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
              }else{
                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('You should define the parameter as an ObjectID.');

                res.json(RECURSIVE_CONTENT);
              }
              break;

            case 'fragments':
              if (Modules.Functions._checkIsAValidObjectID(req.params.token) === true){
                var _TARGET_MATCHING_CRITERIA = [
                  {
                    "_id": _TOKEN
                  },
                  {
                    "end_user_id": _TOKEN
                  },
                  {
                    "cardinal_id": _TOKEN
                  },
                  {
                    "product.category._id": _TOKEN
                  },
                  {
                    "features.feature_id": _TOKEN
                  },
                  {
                    "features.warehouse._id": _TOKEN
                  }
                ];

                _CRITERIA = [
                  {
                    "$lookup": {
                      "from": "products",
                      "localField": "product_id",
                      "foreignField": "_id",
                      "as": "product"
                    }
                  },
                  {
                    "$unwind": {
                      "path": "$product",
                      "preserveNullAndEmptyArrays": true
                    }
                  },
                  {
                    "$lookup": {
                      "from": "taxonomies",
                      "localField": "product.category_id",
                      "foreignField": "_id",
                      "as": "product.category"
                    }
                  },
                  {
                    "$unwind": {
                      "path": "$product.category",
                      "preserveNullAndEmptyArrays": true
                    }
                  },
                  {
                    "$match": {
                      "$and": [
                        {
                          "product.category.key": "PRODUCT_CATEGORY",
                          "product.verified": true
                        },
                        {
                          "$or": _TARGET_MATCHING_CRITERIA
                        }
                      ]
                    }
                  },
                  {
                    "$addFields": {
                      "product.category.key": {
                        "$ifNull": [ "$product.category.cumulative_value", "$product.category.value" ]
                      },
                      "features": {
                        "$concatArrays": [
                          {
                            "$ifNull": [
                              {
                                "$map": {
                                  "input": "$features",
                                  "as": "feature",
                                  "in": {
                                    "$mergeObjects": [
                                      "$$feature",
                                      {
                                        "parent": "FRAGMENT"
                                      }
                                    ]
                                  }
                                }
                              },
                              []
                            ]
                          },
                          {
                            "$ifNull": [
                              {
                                "$map": {
                                  "input": "$product.features",
                                  "as": "feature",
                                  "in": {
                                    "$mergeObjects": [
                                      "$$feature",
                                      {
                                        "parent": "PRODUCT"
                                      }
                                    ]
                                  }
                                }
                              },
                              []
                            ]
                          }
                        ]
                      }
                    }
                  },
                  {
                    "$project": {
                      "product_id": 0,
                      "product.category_id": 0,
                      "product.category.value": 0,
                      "product.category.cumulative_value": 0,
                      "product.features": 0,
                      "product.created_at": 0,
                      "product.modified_at": 0,
                      "product.verified": 0
                    }
                  }
                ];

                _COLLECTION.aggregate(_CRITERIA)
                .toArray(function(error, docs){
                  if (error != null){
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    var _RESPONSE = [];

                    if (docs.length > 0){
                      if (docs[0]._id == req.params.token){
                        _RESPONSE = docs[0];
                      }else{
                        _RESPONSE = docs;
                      }
                    }

                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(_RESPONSE);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
              }else{
                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('You should define the parameter as an ObjectID.');

                res.json(RECURSIVE_CONTENT);
              }
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
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The endusers collection find request could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(docs);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
              break;

            case 'search':
              if (Modules.Functions._checkIsAValidObjectID(req.params.token) !== true){
                const _SUB_ROUTE = req.params.token.toLowerCase();

                switch (_SUB_ROUTE) {
                  case 'products':
                    const _TARGET_QUERY = _THREAD.query || _THREAD.q;

                    if (typeof _TARGET_QUERY != 'undefined'){
                      var _TARGET_MATCHING_CRITERIA = [
                        {
                          "name": new RegExp(`\.*${_TARGET_QUERY}\.*`, 'gi')
                        },
                        {
                          "category.key": new RegExp(`\.*${_TARGET_QUERY}\.*`, 'gi')
                        },
                        {
                          "tags": {
                            "$in": [
                              new RegExp(`\.*${_TARGET_QUERY}\.*`, 'gi')
                            ]
                          }
                        }
                      ];

                      _CRITERIA = [
                        {
                          "$lookup": {
                            "from": "taxonomies",
                            "localField": "category_id",
                            "foreignField": "_id",
                            "as": "category"
                          }
                        },
                        {
                          "$unwind": {
                            "path": "$category",
                            "preserveNullAndEmptyArrays": true
                          }
                        },
                        {
                          "$match": {
                            "$and": [
                              {
                                "category.key": "PRODUCT_CATEGORY",
                                "verified": true
                              },
                              {
                                "$or": _TARGET_MATCHING_CRITERIA
                              }
                            ]
                          }
                        },
                        {
                          "$addFields": {
                            "category.key": {
                              "$ifNull": [ "$category.cumulative_value", "$category.value" ]
                            }
                          }
                        },
                        {
                          "$project": {
                            "category_id": 0,
                            "category.value": 0,
                            "category.features": 0,
                            "category.cumulative_value": 0
                          }
                        }
                      ];

                      _COLLECTION = _DB.collection(_SUB_ROUTE),

                      _COLLECTION.aggregate(_CRITERIA)
                      .toArray(function(error, docs){
                        if (error != null){
                          const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

                          res.json(RECURSIVE_CONTENT);
                        }else{
                          var _RESPONSE = [];

                          if (docs.length > 0){
                            if (docs[0]._id == req.params.token){
                              _RESPONSE = docs[0];
                            }else{
                              _RESPONSE = docs;
                            }
                          }

                          const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(_RESPONSE);

                          res.json(RECURSIVE_CONTENT);

                          client.close();
                        }
                      });
                    }else{
                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('You shoud define the query parameter.');

                      res.json(RECURSIVE_CONTENT);
                    }
                    break;

                  default:
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('The name of your desired search sub route has not been defined.');

                    res.json(RECURSIVE_CONTENT);
                    break;
                }
              }else{
                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`You can\'t use ObjectID to search.`, 700);

                res.json(RECURSIVE_CONTENT);
              }
              break;

            default:
              const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

              res.json(RECURSIVE_CONTENT);
              break;
          }

          if (_IS_COLLECTION_READY_TO_RESPONSE){
            _CRITERIA = {
              _id: _TOKEN
            };

            _COLLECTION.findOne(_CRITERIA, function(findQueryError, doc){
              if (findQueryError != null){
                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection find request could\'t be processed.`, 700);

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

  app.get(`${Modules.Functions._getEndpointOfAPI()}/usergroups/type/:token`, (req, res) => {
    const _TOKEN = req.params.token,
          _THREAD = req.query;

    MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
      if (connectionError != null){
          res.json(_LOCAL_FUNCTIONS._throwConnectionError());
        }else{
          const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                _COLLECTION = _DB.collection('usergroups');

          var _CRITERIA = {
                type: Modules.Functions._convertTokenToKeyword(_TOKEN)
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
              const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The usergroups collection find request could\'t be processed.`, 700);

              res.json(RECURSIVE_CONTENT);
            }else{
              const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc);

              res.json(RECURSIVE_CONTENT);

              client.close();
            }
          });
        }
    });
  });

  app.get(`${Modules.Functions._getEndpointOfAPI()}/usergroups/type/:token/:head`, (req, res) => {
    const _TOKEN = req.params.token,
          _HEAD = req.params.head;

    if (_HEAD != ''){
      const _HEAD_KEYWORD = Modules.Functions._convertTokenToKeyword(_HEAD);

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
                      type: Modules.Functions._convertTokenToKeyword(_TOKEN),
                      reference_id: {
                        "$exists": false
                      }
                    };

                _COLLECTION.findOne(_CRITERIA, function(userFindQueryError, doc){
                  if (userFindQueryError != null){
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The usergroups collection find request could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc);

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
              }
          });
          break;
        default:
          const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`You should choose the user level type.`, 700);

          res.json(RECURSIVE_CONTENT);
          break;
      }
    }
  });

  app.get(`${Modules.Functions._getEndpointOfAPI()}/role/brand/:brand_name/:token`, (req, res) => {
    const _BRAND_NAME = req.params.brand_name,
          _TOKEN = req.params.token;

    MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
      if (connectionError != null){
          res.json(_LOCAL_FUNCTIONS._throwConnectionError());
        }else{
          const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                _COLLECTION = _DB.collection('endusers');

          var _CRITERIA = {
                "brand.name": Modules.Functions._convertKeywordToToken(_BRAND_NAME)
              };

          _COLLECTION.findOne(_CRITERIA, function(userFindQueryError, doc){
            if (userFindQueryError != null){
              const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The endusers collection find request could\'t be processed.`, 700);

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
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`Matching Role\'s token operation could\'t be processed.`, 700);

                    res.json(RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(((roleCheckDoc.length > 0)? roleCheckDoc[0]: {}));

                    res.json(RECURSIVE_CONTENT);

                    client.close();
                  }
                });
              }else{
                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`We couldn\'t find any brand with name ${Modules.Functions._convertKeywordToToken(_BRAND_NAME)}.`, 700);

                res.json(RECURSIVE_CONTENT);
              }
            }
          });
        }
    });
  });
};
