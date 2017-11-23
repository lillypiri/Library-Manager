const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pug = require('pug');

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static(__dirname + '/public'));
app.set('view engine', 'pug');

// routes
app.get('/', function(req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!' });
});

app.get('/all_books', function(req, res) {
  res.render('all_books', { title: 'All books' });
});

app.get('/all_patrons', function(req, res) {
  res.render('all_patrons', { title: 'All patrons' })
})

app.get('/all_loans', function(req, res) {
  res.render('all_loans', { title: 'All loans' });
});

app.get('/overdue_loans', function(req, res) {
  res.render('overdue_loans', { title: 'Overdue Loans' });
});

app.get('/checked_loans', function(req, res) {
  res.render('checked_loans', { title: 'Checked out books' });
});

app.get('/new_loan', function(req, res) {
  res.render('new_loan', { title: "New loan" });
});

app.get('/new_patron', function(req, res) {
  res.render('new_patron', { title: "New patron" });
});

app.get('/new_book', function(req, res) {
  res.render('new_book', { title: "New book" });
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

// app.use(function(err, req, res, next) {
//   console.error(err.stack)
//   res.status(err.status || 500).send('Something broke!');
// });