module.exports = (app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY) => {
  const POST_REQUESTS = require('./api/post.request')(app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY),
        GET_REQUESTS = require('./api/get.request')(app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY),
        PUT_REQUESTS = require('./api/put.request')(app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY),
        DELETE_REQUESTS = require('./api/delete.request')(app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY),
        SOCKET_REQUESTS = require('./sockets/socket.request')(app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY);
};
