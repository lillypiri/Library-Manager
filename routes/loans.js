const express = require('express');
const router = express.Router();

const Loans = require('../models').Loans;

// Index - list all loans
router.get('/', (request, response) => {
  Loans.findAll({ order: [['return_by', 'desc']] })
    .then(loans => {
      response.render('loans/index', { loans });
    })
    .catch(err => {
      console.log(err);
      response.sendStatus(500);
    });
});

// create a loan
router.post('/', function(request, response, next) {
  Loans.create(request.body)
    .then(function(loans) {
      response.redirect('/loans/');
    })
    .catch(function(err) {
      if (err.name === 'SequelizeValidationError') {
        response.render('loans/new', {
          loans: Loans.build(request.body),
          title: 'New Loan',
          errors: err.errors
        });
      } else {
        throw err;
      }
    })
    .catch(function(err) {
      response.sendStatus(500);
    });
});

// book form
router.get('/new', function(request, response, next) {
  response.render('loans/new', { loans: Loans.build(), title: 'New loan' });
});

// get an individual loan
router.get('/:id', function(request, response, next) {
  Loans.findById(request.params.id)
    .then(function(loan) {
      if (loan) {
        reponse.render('loans/show', { loan: loan, title: loan.title });
      } else {
        response.sendStatus(404);
      }
    })
    .catch(function(err) {
      console.log('ERRORRRRR', err);
      response.sendStatus(500);
    });
});

// delete loan form
router.get('/:id/delete', function(request, response, next) {
  Loans.findById(request.params.id)
    .then(function(loan) {
      if (loan) {
        // console.log('loan', loan);
        response.render('loans/delete', { loan: loan, title: 'Delete loan' });
      } else {
        response.sendStatus(404);
      }
    })
    .catch(function(err) {
      console.log('THING', err);
      response.sendStatus(500);
    });
});

//delete individual loan
router.delete('/:id', function(request, response, next) {
  console.log('IN DELETE');
  Loans.findById(request.params.id)
    .then(function(loan) {
      if (loan) {
        console.log('in loan');
        return loan.destroy();
      } else {
        response.sendStatus(404);
        console.log('SENDING A 404!!!!!!!!!!!!!!!!!!!!!!!!!!!!', loan);
      }
    })
    .then(function() {
      response.redirect('/loans');
    })
    .catch(function(err) {
      console.log('loan', loan);
      console.log('THING', err);
      response.sendStatus(500);
    });
});

module.exports = router;
