const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pug = require('pug');
const methodOverride = require('method-override');

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.set('view engine', 'pug');

app.get('/', function(req, res) {
  res.render('index');
});

// routes
app.use('/books', require('./routes/books'));
app.use('/patrons', require('./routes/patrons'));
app.use('/loans', require('./routes/loans'));

// Run the server
app.listen(7777, () => {
  console.log("Listening on 7777");
});

// Handle errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
