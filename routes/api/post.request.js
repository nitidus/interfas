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
                    _SECRET_CONTENT_OF_FILE_EXTENDED_PATH_WITH_APPENDED_KEY = crypto.createHmac('sha256', INTERFAS_KEY).update(_SECRET_CONTENT_OF_TOKEN).digest('hex').slice(0, 7),
                    _FILE_EXTENSION_MIMETYPE = _THREAD.personal.profile.match(/data:image\/\w+/ig)[0].replace(/data:image\//ig, '');

              _Functions._uploadUserProfilePhoto(_THREAD.personal.profile, `${_SECRET_CONTENT_OF_FILE_EXTENDED_PATH_WITH_APPENDED_KEY}/${_SECRET_CONTENT_OF_FILE_NAME_WITH_APPENDED_KEY}.${_FILE_EXTENSION_MIMETYPE}`);
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

            _IS_COLLECTION_READY_TO_ABSORB = true;
          }else{
            res.json(_LOCAL_FUNCTIONS._throwNewInstanceError(_COLLECTION_NAME));
          }
          break;

        case 'endusers':
          if ((typeof _THREAD.user_id != 'undefined')){
            _THREAD.viewed = 0;
            _THREAD.user_id = new ObjectID(_THREAD.user_id);

            //End User detection for user groups

            _IS_COLLECTION_READY_TO_ABSORB = true;
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

        default:
          const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage('The name of your desired collection has not been defined.');

          res.json(RECURSIVE_CONTENT);
      }

      if (_IS_COLLECTION_READY_TO_ABSORB){
        _THREAD.modified_at = _THREAD.created_at = _TODAY;

        MongoClient.connect(CONNECTION_URL, CONNECTION_CONFIG.URL_PARSER_CONFIG, function(connectionError, client){
          if (connectionError != null){
              const RECURSIVE_CONTENT = _Functions._throwErrorWithCodeAndMessage(`The ${_COLLECTION_NAME} collection could not be reached.`, 700);

              res.json(RECURSIVE_CONTENT);

              client.close();
            }else{
              const _DB = client.db(CONNECTION_CONFIG.DB_NAME),
                    _COLLECTION = _DB.collection(_COLLECTION_NAME);

              _COLLECTION.insert(_THREAD, function(insertQueryError, doc){
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
        });
      }
    }
  });
};
