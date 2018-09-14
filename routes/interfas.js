module.exports = (app, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY) => {
  const POST_REQUESTS = require('./api/post.request')(app, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY),
        GET_REQUESTS = require('./api/get.request')(app, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY),
        PUT_REQUESTS = require('./api/put.request')(app, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY),
        DELETE_REQUESTS = require('./api/delete.request')(app, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY);
};
