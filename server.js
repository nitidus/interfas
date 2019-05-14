var express = require('express'),
    cors = require('cors'),
    app = express(),
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
      TARGET_PORT = process.env.APP_PORT || process.env.PORT || 16374;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('json spaces', 2);

// app.use(cors());
app.use(cookieParser());

app.use(
  session({
    name: 'interfas',
    secret: INTERFAS_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: (1000 * 60 * 60 * 2),
      secure: false
    },
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

app.use(express.static('public'));

app.use('/assets/', express.static('public/assets'));

const ROUTES = require('./routes/interfas')(app, io, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY);

http.listen(TARGET_PORT, () => {
  console.log(`Interfas is running on port ${TARGET_PORT}!`);
});
