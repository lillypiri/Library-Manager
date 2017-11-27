const express = require('express');
const router = express.Router();

const Loans = require('../models').Loans;

// Index - list all loans
router.get('/', (request, response) => {
  Loans.findAll({ order: [['return_by', 'desc' ]] })
    .then(loans => {
      response.render('loans/index', { loans });
    })
    .catch(err => {
      console.log(err);
      response.sendStatus(500);
    });
});

module.exports = router;