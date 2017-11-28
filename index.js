const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pug = require('pug');
const methodOverride = require('method-override');

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.set('view engine', 'pug');

// routes
app.use('/books', require('./routes/books'));
app.use('/patrons', require('./routes/patrons'));
app.use('/loans', require('./routes/loans'));

app.get('/', function(req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!' });
});

app.get('/checked_loans', function(req, res) {
  res.render('checked_loans', { title: 'Checked out books' });
});


// Run the server
app.listen(7777, () => {
  console.log("Listening on 7777");
});

// handle errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
