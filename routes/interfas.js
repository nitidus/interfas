const axios = require('axios');

const Modules = require('../src/modules');

module.exports = (app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY) => {
  const POST_REQUESTS = require('./api/post.request')(app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY),
        GET_REQUESTS = require('./api/get.request')(app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY),
        PUT_REQUESTS = require('./api/put.request')(app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY),
        DELETE_REQUESTS = require('./api/delete.request')(app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY),
        SOCKET_REQUESTS = require('./sockets/socket.request')(app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY);

  app.get('/', async (req, res) => {
    if (req.session.authenticated === true) {
      res.render('dashboard');
    }else{
      res.render('authorization');
    }
  });

  app.get('/categories', async (req, res) => {
    const _THREAD = req.query;

    let parametersString = '';

    if ((typeof _THREAD.depth != 'undefined') && (typeof _THREAD.ancestors != 'undefined')){
      parametersString = `?depth=${_THREAD.depth}&ancestors=${_THREAD.ancestors}`;
    }

    axios(`${Modules.Functions._getFullEndpointOfAPI()}/taxonomies/pc${parametersString}`)
    .then((response) => {
      if (response.status === 200){
        let knowledge = response.data;

        if (req.session.authenticated === true) {
          let finalResponse = {
            path: 'categories',
            data: knowledge.data
          };

          if ((typeof _THREAD.depth != 'undefined') && (typeof _THREAD.ancestors != 'undefined') && (typeof _THREAD.key != 'undefined')){
            finalResponse.previous = {
              depth: parseInt(_THREAD.depth),
              ancestors: _THREAD.ancestors.split(','),
              key: _THREAD.key.replace(/\"/gi, '')
            };

            if (typeof _THREAD.cumulative_key != 'undefined'){
              finalResponse.previous.cumulative_key = _THREAD.cumulative_key.replace(/\"/gi, '');
            }
          }

          res.render('dashboard', finalResponse);
        }else{
          res.render('authorization');
        }
      }
    })
  });

  app.get('/products', async (req, res) => {
    const _THREAD = req.query;

    axios(`${Modules.Functions._getFullEndpointOfAPI()}/products`)
    .then((response) => {
      if (response.status === 200){
        let knowledge = response.data;

        if (req.session.authenticated === true) {
          res.render('dashboard', {
            path: 'products',
            data: knowledge.data
          });
        }else{
          res.render('authorization');
        }
      }
    })
  });

  app.get('/products/:token', async (req, res) => {
    const _TOKEN = req.params.token,
          _THREAD = req.query;

    if (Modules.Functions._checkIsAValidObjectID(_TOKEN) !== true){
      if (req.session.authenticated === true) {
        res.render('dashboard', {
          path: 'products/new'
        });
      }else{
        res.render('authorization');
      }
    }else{
      axios(`${Modules.Functions._getFullEndpointOfAPI()}/products/${_TOKEN}`)
      .then((response) => {
        if (response.status === 200){
          let knowledge = response.data;

          if (req.session.authenticated === true) {
            res.render('dashboard', {
              path: 'products/tokenized',
              data: knowledge.data
            });
          }else{
            res.render('authorization');
          }
        }
      })
    }
  });

  app.post('/auth', async (req, res) => {
    const credential = req.body;

    if (typeof credential != 'undefined'){
      if ((credential.username == 'admin') && (credential.password == 'admin')){
        req.session.authenticated = true;

        res.json(req.session);
      }
    }
  })

  app.get('/:app_name/recover/password/:token', async (req, res) => res.redirect(`${req.params.app_name}://recover/password/${_TARGET_TOKEN}`))

  app.get('/logout', async (req, res) => {
    delete req.session.authenticated;

    res.redirect('/');
  })
};
