var crypto = require('crypto'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    ObjectID = require('mongodb').ObjectID;

const _Functions = require('../../src/modules/functions');
const _LOCAL_FUNCTIONS = {

};

module.exports = (app, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY) => {
  app.get('/:collection', (req, res) => {
    if (typeof req.params.collection != 'undefined'){
      const _COLLECTION_NAME = req.params.collection.toLowerCase();

      var _IS_COLLECTION_READY_TO_RESPONSE = false;

      MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
        if (connectionError != null){
            const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection could not be reached.`, 700);

            res.json(RECURSIVE_CONTENT);

            client.close();
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

              case 'users':
              case 'usergroups':
              case 'wallets':
              case 'messages':
              case 'warehouses':
              case 'turnovers':
              case 'orders':
              case 'currencies':
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
            _TOKEN = new ObjectID(req.params.token),
            _THREAD = req.query;

      var _IS_COLLECTION_READY_TO_RESPONSE = false;

      MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
        if (connectionError != null){
            const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection could not be reached.`, 700);

            res.json(RECURSIVE_CONTENT);

            client.close();
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
              _IS_COLLECTION_READY_TO_RESPONSE = true;
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

              if ((typeof _THREAD.reference_id != 'undefined') || (typeof _THREAD.reference != 'undefined')){
                const _PREFERED_REFERENCE_TOKEN = _THREAD.reference_id || _THREAD.reference,
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

              if ((typeof _THREAD.user_group_id != 'undefined') || (typeof _THREAD.usergroup_id != 'undefined') || (typeof _THREAD.usergroupId != 'undefined') || (typeof _THREAD.usergroupID != 'undefined') || (typeof _THREAD.userGroupID != 'undefined') || (typeof _THREAD.userGroupId != 'undefined')){
                const _PREFERED_USER_GROUP_TOKEN = _THREAD.user_group_id || _THREAD.usergroup_id || _THREAD.usergroupId || _THREAD.usergroupID || _THREAD.userGroupID || _THREAD.userGroupId,
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
          const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection could not be reached.`, 700);

          res.json(RECURSIVE_CONTENT);

          client.close();
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
                const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The usergroups collection could not be reached.`, 700);

                res.json(RECURSIVE_CONTENT);

                client.close();
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
                    //`The usergroups collection find request could\'t be processed.`
                    const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(_CRITERIA, 700);

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
};
