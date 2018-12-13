var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

const CONNECTION_URL = 'mongodb://localhost:27017/interfas',
      CONNECTION_CONFIG = {
        DB_NAME: 'interfas',
        URL_PARSER_CONFIG: {
          useNewUrlParser: true
        }
      },
      INTERFAS_KEY = 'vqoE3yZn+BRN01pwhCvzWqeDXaot7Nix81qX3bZUgY36LMqjPdYd17H8oJID3I4W5CejHp/ozVshq8yu6KLhsA==',
      TARGET_PORT = (typeof process.env.APP_PORT != 'undefined')? process.env.APP_PORT: 16374;

app.set('json spaces', 2);

app.use(cookieParser());

app.use(
  session({
    secret: INTERFAS_KEY,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      url: CONNECTION_URL
    })
  })
);

app.use(bodyParser.json({
  limit: '7mb'
}));

app.use(bodyParser.urlencoded({
  extended: true
}));

const ROUTES = require('./routes/interfas')(app, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY);

http.listen(TARGET_PORT, () => {
  console.log(`Interfas is running on port ${TARGET_PORT}!`);
});
