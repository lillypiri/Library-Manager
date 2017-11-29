const express = require('express');
const router = express.Router();
const format = require('date-fns/format');

function d(date) {
  if (!date) return '';
  
  return format(date, 'YYYY-MM-DD');
}

const { Sequelize, Loans, Books, Patrons } = require('../models');

// Index - list all loans
router.get('/', (request, response) => {
  let options = { 
    order: [['return_by', 'desc']], 
    include: [
      { model: Books },
      { model: Patrons }
    ],
    where: {}
  };

  // //define a where object -
  // console.log(request.query);
  if (request.query.filter === 'overdue') {
    console.log('Inside filter');
    options.where = {
      return_by: {
        [Sequelize.Op.lt]: new Date()
      },
      returned_on: null
    };
    
  } else if (request.query.filter === 'checked_out') {
    console.log('IS THIS THING ON');
    options.where = {
      loaned_on: {
        [Sequelize.Op.ne]: null
      },
      returned_on: {
        [Sequelize.Op.eq]: null
      }
    };
  }

  Loans.findAll(options)
    .then(loans => {
      response.render('loans/index', { loans, d });
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
      console.log("here's the thing in create", err);
      if (err.name === 'SequelizeValidationError') {
        response.render('loans/new', {
          loans: Loans.build(request.body),
          title: 'New Loan',
          errors: err.errors
        });
      } else {
        response.sendStatus(500);
      }
    })
});


// new loan form
router.get('/new', function(request, response) {
  console.log('hmmm');

  // Get a list of all books that are not already on loan
  Books.findAll({
    include: [
      {
        model: Loans,
        where: {
          [Sequelize.Op.or]: [
            { 
              loaned_on: {
                [Sequelize.Op.eq]: null
              },
            },
            {
              returned_on: {
                [Sequelize.Op.ne]: null
              }
            }
          ]
        }
      }
    ]
  })
    .then(books => {
      console.log('then books => found the books');
      // Get a list of all patrons
      Patrons.findAll()
        .then(patrons => {
          console.log("then found the patrons")
          response.render('loans/new', { title: 'New loan', newLoan: Loans.build(), books, patrons, d });
          console.log('after the patrons');
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
});

// get an individual loan
router.get('/:id', function(request, response, next) {
  Loans.findById(request.params.id)
    .then(function(loan) {
      if (loan) {
        response.render('loans/show', { loan: loan, title: loan.title });
      } else {
        response.sendStatus(404);
      }
    })
    .catch(function(err) {
      console.log('ERRORRRRR', err);
      response.sendStatus(500);
    });
});

// update loan form
router.get('/:id/return', async (request, response) => {
  const loan = await Loans.findById(request.params.id);
    
  if (loan) {
    response.render('loans/return', { loan, title: 'Return a loan', d });
  } else {
    response.sendStatus(404);
  }  
});

// update a loan
router.put('/:id', async (request, response) => {
  const loan = await Loans.findById(request.params.id);
  
  if (loan) {
    try {
      await loan.update(request.body);
    } catch (err) {
      if (err.name === 'SequelizeValidationError') {
        return response.render('loans/return', {
          title: 'Return a book',
          loan,
          errors: err.errors,
          d
        });
      } else {
        console.log(err);
        return response.sendStatus(500);
      }
    }
    
    // All good
    response.redirect('/loans/' + request.params.id);
  } else {
    // Loan not found
    return response.send(404);
  }
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
