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
            switch (_COLLECTION_NAME) {
              case 'endusers':
                const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                      _COLLECTION = _DB.collection(_COLLECTION_NAME);

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
                    "$unwind": "$user"
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
                _IS_COLLECTION_READY_TO_RESPONSE = true;
                break;

              default:
                const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

                res.json(RECURSIVE_CONTENT);
            }

            if (_IS_COLLECTION_READY_TO_RESPONSE){
              const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                    _COLLECTION = _DB.collection(_COLLECTION_NAME);

              _COLLECTION.find()
              .toArray(function(userFindQueryError, doc){
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

  app.get('/:collection/:token', (req, res) => {
    if (typeof req.params.collection != 'undefined'){
      const _COLLECTION_NAME = req.params.collection.toLowerCase(),
            _TOKEN = new ObjectID(req.params.token);

      var _IS_COLLECTION_READY_TO_RESPONSE = false;

      MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
        if (connectionError != null){
            const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection could not be reached.`, 700);

            res.json(RECURSIVE_CONTENT);

            client.close();
        }else{
          switch (_COLLECTION_NAME) {
            case 'endusers':
              const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                    _COLLECTION = _DB.collection(_COLLECTION_NAME);

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
                  "$unwind": "$user"
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
              _IS_COLLECTION_READY_TO_RESPONSE = true;
              break;

            default:
              const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

              res.json(RECURSIVE_CONTENT);
          }

          if (_IS_COLLECTION_READY_TO_RESPONSE){
            const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                  _COLLECTION = _DB.collection(_COLLECTION_NAME);

            const _CRITERIA = {
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
    const _TOKEN = req.params.token;

    MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
      if (connectionError != null){
          const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection could not be reached.`, 700);

          res.json(RECURSIVE_CONTENT);

          client.close();
        }else{
          const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                _COLLECTION = _DB.collection('usergroups');

          const _CRITERIA = {
            type: _Functions._convertTokenToKeyword(_TOKEN)
          };

          _COLLECTION.find(_CRITERIA)
          .toArray(function(userFindQueryError, doc){
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
    });
  });
};
