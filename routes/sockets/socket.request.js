var crypto = require('crypto'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    ObjectID = require('mongodb').ObjectID;

const Modules = require('../../src/modules');

module.exports = (app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY) => {
  io.on('connect', (socket) => {
    const SOCKET_INSERT_REQUESTS = require('./socket.request.insert')(app, { io, socket }, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY);
  });
};
