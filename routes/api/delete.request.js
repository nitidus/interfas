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
  app.delete('/:collection/:token', (req, res) => {
    if (typeof req.params.collection != 'undefined'){
      const _COLLECTION_NAME = req.params.collection.toLowerCase(),
            _TOKEN = new ObjectID(req.params.token),
            _THREAD = req.query;

      var _IS_COLLECTION_READY_TO_REMOVE = false;

      MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
        if (connectionError != null){
            res.json(_LOCAL_FUNCTIONS._throwConnectionError());
        }else{
          var _DB = client.db(CONNECTION_CONFIG.DB_NAME),
              _COLLECTION = _DB.collection(_COLLECTION_NAME),
              _CRITERIA = {};

          switch (_COLLECTION_NAME) {
            case 'endusers':
            case 'users':
            case 'usergroups':
            case 'wallets':
            case 'messages':
            case 'warehouses':
            case 'turnovers':
            case 'orders':
            case 'currencies':
            case 'taxonomies':
            case 'products':
            case 'fragments':
            case 'plans':
            case 'histories':
              _IS_COLLECTION_READY_TO_REMOVE = true;
              break;
            default:
              const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

              res.json(RECURSIVE_CONTENT);
              break;
          }

          if (_IS_COLLECTION_READY_TO_REMOVE){
            const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                  _COLLECTION = _DB.collection(_COLLECTION_NAME);

            _CRITERIA._id = _TOKEN;

            _COLLECTION.deleteOne(_CRITERIA, function(removeQueryError, doc){
              if (removeQueryError != null){
                const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection delete request could\'t be processed.`, 700);

                res.json(RECURSIVE_CONTENT);
              }else{
                if (doc.deletedCount != 1){
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in ${_COLLECTION_NAME} collection could\'t be deleted.`, 700);

                  res.json(RECURSIVE_CONTENT);
                }else{
                  const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc.result);

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
