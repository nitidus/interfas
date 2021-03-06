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

module.exports = (app, { io, socket }, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY) => {
  socket.on('collection/find/token', (req) => {
    if (typeof req.collection != 'undefined'){
      var _COLLECTION_NAME = req.collection.toLowerCase(),
          _TODAY = new Date(),
          _TOKEN = req.token || '',
          _THREAD = req.body || req.data || {},
          _IS_COLLECTION_READY_TO_RESPONSE = false;

      MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
        if (connectionError != null){
            socket.emit(`collection/founded/${_COLLECTION_NAME}/${Modules.Functions._convertTokenToSnakeword(_TOKEN)}`, _LOCAL_FUNCTIONS._throwConnectionError());
          }else{
            var _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                _COLLECTION = _DB.collection(_COLLECTION_NAME),
                _CRITERIA = [];

            switch (_COLLECTION_NAME) {
              case 'search':
                if (Modules.Functions._checkIsAValidObjectID(_TOKEN) !== true){
                  const _SUB_ROUTE = _TOKEN.toLowerCase();

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

                            socket.emit(`collection/founded/${_COLLECTION_NAME}/${_SUB_ROUTE}`, RECURSIVE_CONTENT);
                          }else{
                            var _RESPONSE = [];

                            if (docs.length > 0){
                              if (docs[0]._id == _TOKEN){
                                _RESPONSE = docs[0];
                              }else{
                                _RESPONSE = docs;
                              }
                            }

                            const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(_RESPONSE);

                            socket.emit(`collection/founded/${_COLLECTION_NAME}/${_SUB_ROUTE}`, RECURSIVE_CONTENT);

                            client.close();
                          }
                        });
                      }else{
                        const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('You shoud define the query parameter.');

                        socket.emit(`collection/founded/${_COLLECTION_NAME}/${_SUB_ROUTE}`, RECURSIVE_CONTENT);
                      }
                      break;

                    default:
                      const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('The name of your desired search sub route has not been defined.');

                      socket.emit(`collection/founded/${_COLLECTION_NAME}/${Modules.Functions._convertTokenToSnakeword(_TOKEN)}`, RECURSIVE_CONTENT);
                      break;
                  }
                }else{
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`You can\'t use ObjectID to search.`, 700);

                  socket.emit(`collection/founded/${_COLLECTION_NAME}/${Modules.Functions._convertTokenToSnakeword(_TOKEN)}`, RECURSIVE_CONTENT);
                }
                break;

              case 'taxonomies':
                _CRITERIA = [
                  {
                    "$match": {
                      "_id": _TOKEN
                    }
                  }
                ];

                let _NORMAL_PROJECTION = {
                  "key": "$value",
                  "ancestors": 1,
                  "created_at": 1,
                  "modified_at": 1
                };

                if (Modules.Functions._checkIsAValidObjectID(_TOKEN) !== true){
                  var _TOKEN_KEYWORD = Modules.Functions._convertTokenToKeyword(_TOKEN);

                  switch (_TOKEN_KEYWORD) {
                    case 'PC':
                    case 'P.C':
                    case 'P.C.':
                      _NORMAL_PROJECTION["features"] = 1;
                      _NORMAL_PROJECTION["cumulative_key"] = "$cumulative_value";
                      _TOKEN_KEYWORD = 'PRODUCT_CATEGORY';
                      break;

                    case 'PF':
                    case 'P.F':
                    case 'P.F.':
                      _TOKEN_KEYWORD = 'PRODUCT_FEATURE';
                      break;

                    case 'PSH':
                    case 'P.S.H':
                    case 'P.F.H.':
                      _TOKEN_KEYWORD = 'PRODUCT_SHIPPING_METHOD';
                      break;
                  }

                  _TARGET_MATCHING_CRITERIA = {
                    "key": _TOKEN_KEYWORD
                  };

                  _CRITERIA = [
                    {
                      "$match": {
                        "key": _TOKEN_KEYWORD
                      }
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

                    socket.emit(`collection/founded/${_COLLECTION_NAME}/${Modules.Functions._convertTokenToSnakeword(_TOKEN)}`, RECURSIVE_CONTENT);
                  }else{
                    var _RESPONSE = [];

                    if (docs.length > 0){
                      if (docs[0]._id == _TOKEN){
                        _RESPONSE = docs[0];
                      }else{
                        _RESPONSE = docs;
                      }
                    }

                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(_RESPONSE);

                    socket.emit(`collection/founded/${_COLLECTION_NAME}/${Modules.Functions._convertTokenToSnakeword(_TOKEN)}`, RECURSIVE_CONTENT);

                    client.close();
                  }
                });
                break;

              default:
                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

                socket.emit(`collection/founded/${_COLLECTION_NAME}/${Modules.Functions._convertTokenToSnakeword(_TOKEN)}`, RECURSIVE_CONTENT);
                break;
            }

            if (_IS_COLLECTION_READY_TO_RESPONSE){
              _CRITERIA = {
                _id: _TOKEN
              };

              _COLLECTION.findOne(_CRITERIA, function(findQueryError, doc){
                if (findQueryError != null){
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection insert request could\'t be processed.`, 700);

                  socket.emit(`collection/founded/${_COLLECTION_NAME}/${Modules.Functions._convertTokenToSnakeword(_TOKEN)}`, RECURSIVE_CONTENT);
                }else{
                  if (doc.insertedCount != 1){
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in ${_COLLECTION_NAME} collection could\'t be inserted.`, 700);

                    socket.emit(`collection/founded/${_COLLECTION_NAME}/${Modules.Functions._convertTokenToSnakeword(_TOKEN)}`, RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc.ops[0]);

                    socket.emit(`collection/founded/${_COLLECTION_NAME}/${Modules.Functions._convertTokenToSnakeword(_TOKEN)}`, RECURSIVE_CONTENT);

                    client.close();
                  }
                }
              });
            }
          }
      });
    }
  })
};
