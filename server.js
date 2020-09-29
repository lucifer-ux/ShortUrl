'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var shortid = require('shortid');
var cors = require('cors');
require('dotenv').config();
var app = express();
var Schema = mongoose.Schema
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
// mongoose.connect(process.env.DB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser');



app.use('/public', express.static(process.cwd() + '/public'));

app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(bodyParser.json())
//SCHEMA
let ShortUrlSchema = new Schema({
  name: String,
  short: String,
})

const ShortUrl = mongoose.model('ShortUrl', ShortUrlSchema);

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res, next) {
  res.json({
    greeting: 'hello API'
  });
  next();
});



app.post("/api/shorturl/new", (req, res, next) => {
  let suffix = shortid.generate()
  console.log(suffix)
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)
  if (!req.body.url.match(urlRegex)) {
    res.json({
      error: "invalid url"
    })
    return

  }
  let newurl = new ShortUrl({
    name: req.body.url,
    short: suffix
  })

  newurl.save((err, data) => {
    if (err) return console.log(err)

    res.json({
      original_url: req.body.url,
      suffix: suffix,
      newShortUrl: "/api/shorturl" + suffix
    })
    next();
  })
})


app.get('/api/shorturl/:input', (req, res) => {
  let input = req.params.input;
  ShortUrl.findOne({
    short: input
  }, (err, result) => {
    if (!err && result != undefined) {
      res.redirect(result.name)
    }
  })
})



app.listen(port, function () {
  console.log('Node.js listening ...');
});