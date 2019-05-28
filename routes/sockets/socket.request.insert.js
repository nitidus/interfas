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
  socket.on('collection/insert', (req) => {
    if (typeof req.collection != 'undefined'){
      var _COLLECTION_NAME = req.collection.toLowerCase(),
          _TODAY = new Date(),
          _THREAD = req.body || req.data || {},
          _IS_COLLECTION_READY_TO_ABSORB = false;

      MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
        if (connectionError != null){
            socket.emit(`collection/inserted/${_COLLECTION_NAME}`, _LOCAL_FUNCTIONS._throwConnectionError());
          }else{
            var _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                _COLLECTION = _DB.collection(_COLLECTION_NAME),
                _CRITERIA = [];

            switch (_COLLECTION_NAME) {
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
                  if ((typeof _THREAD.end_user_id != 'undefined') && (typeof _THREAD.warehouse_id != 'undefined') && (typeof _THREAD.product_id != 'undefined') && (typeof _THREAD.prices != 'undefined') && (typeof _THREAD.shipping_plans != 'undefined')){
                    _THREAD.end_user_id = new ObjectID(_THREAD.end_user_id);
                    _THREAD.product_id = new ObjectID(_THREAD.product_id);

                    if (typeof _THREAD.cardinal_id != 'undefined'){
                      _THREAD.cardinal_id = new ObjectID(_THREAD.cardinal_id);
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

                    _THREAD.prices = _THREAD.prices.map((item, i) => {
                      let _FINAL_ITEM = item;

                      _FINAL_ITEM.feature_reference_id = new ObjectID(_FINAL_ITEM.feature_reference_id);

                      return _FINAL_ITEM;
                    });

                    _THREAD.shipping_plans = _THREAD.shipping_plans.map((item, i) => {
                      let _FINAL_ITEM = item;

                      _FINAL_ITEM.feature_reference_id = new ObjectID(_FINAL_ITEM.feature_reference_id);
                      _FINAL_ITEM.shipping_method_id = new ObjectID(_FINAL_ITEM.shipping_method_id);

                      return _FINAL_ITEM;
                    });

                    _IS_COLLECTION_READY_TO_ABSORB = true;
                  }
                  break;

                default:
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

                  socket.emit(`collection/inserted/${_COLLECTION_NAME}`, RECURSIVE_CONTENT);
                  break;
            }

            if (_IS_COLLECTION_READY_TO_ABSORB){
              _THREAD.modified_at = _THREAD.created_at = _TODAY;

              _COLLECTION.insertOne(_THREAD, function(insertQueryError, doc){
                if (insertQueryError != null){
                  const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection insert request could\'t be processed.`, 700);

                  socket.emit(`collection/inserted/${_COLLECTION_NAME}`, RECURSIVE_CONTENT);
                }else{
                  if (doc.insertedCount != 1){
                    const RECURSIVE_CONTENT = Modules.Functions._throwErrorWithCodeAndMessage(`The document in ${_COLLECTION_NAME} collection could\'t be inserted.`, 700);

                    socket.emit(`collection/inserted/${_COLLECTION_NAME}`, RECURSIVE_CONTENT);
                  }else{
                    const RECURSIVE_CONTENT = Modules.Functions._throwResponseWithData(doc.ops[0]);

                    socket.emit(`collection/inserted/${_COLLECTION_NAME}`, RECURSIVE_CONTENT);

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
