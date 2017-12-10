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
    include: [{ model: Books }, { model: Patrons }],
    limit: 10,
    offset: 0,
    where: {}
  };

  // console.log(request.query);
  // Overdue and checked out filters
  if (request.query.filter === 'overdue') {
    options.where = {
      return_by: {
        [Sequelize.Op.lt]: new Date()
      },
      returned_on: null
    };
  } else if (request.query.filter === 'checked_out') {
    options.where = {
      loaned_on: {
        [Sequelize.Op.ne]: null
      },
      returned_on: {
        [Sequelize.Op.eq]: null
      }
    };
  } else if (request.query.page) {
    console.log('pagination');
    options.limit = 10;
    options.offset = (request.query.page - 1) * options.limit;
  }

  Loans.findAndCountAll(options)
    .then(loans => {
      let loanCount = loans.count;
      let pageSize = 10;
      let pages = Math.ceil(loanCount / pageSize);
      response.render('loans/index', { loans: loans.rows, loanCount, pageSize, pages: pages, d });
    })
    .catch(err => {
      console.log('find all loans error', err);
      response.sendStatus(500);
    });
});

// Create a loan
router.post('/', (request, response, next) => {
  Loans.create(request.body)
    .then(loan => {
      response.redirect('/loans/');
    })
    .catch(async err => {
      console.log('create a loan error', err);
      if (err.name === 'SequelizeValidationError') {
        response.render('loans/new', {
          loan: Loans.build(request.body),
          title: 'New Loan',
          errors: err.errors,
          books: await Books.findAll(),
          patrons: await Patrons.findAll(),
          d
        });
      } else {
        response.sendStatus(500);
      }
    });
});

// New loan form
router.get('/new', (request, response) => {
  // Get a list of all books that are not already on loan
  Books.findAll()
    .then(books => {
      // Get a list of all patrons
      Patrons.findAll()
        .then(patrons => {
          response.render('loans/new', { title: 'New loan', newLoan: Loans.build(), books, patrons, d });
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
router.get('/:id', (request, response, next) => {
  Loans.findById(request.params.id)
    .then(loan => {
      if (loan) {
        response.render('loans/show', { loan: loan, title: loan.title });
      } else {
        response.sendStatus(404);
      }
    })
    .catch(function(err) {
      console.log('get an individual loan error', err);
      response.sendStatus(500);
    });
});

// Return loan form
router.get('/:id/return', async (request, response) => {
  const loan = await Loans.findById(request.params.id);
  const [book, patron] = await Promise.all([Books.findById(loan.book_id), Patrons.findById(loan.patron_id)]);
  if (loan) {
    response.render('loans/return', { loan, patron, book, title: 'Return a loan', d });
  } else {
    response.sendStatus(404);
  }
});

// Return a loan
router.put('/:id', async (request, response) => {
  const loan = await Loans.findById(request.params.id);

  if (loan) {
    try {
      await loan.update(request.body);
    } catch (err) {
      console.log(err.name);
      if (err.name === 'SequelizeValidationError') {
        return response.render('loans/return', {
          title: 'Return a book',
          loan,
          book: await Books.findById(loan.book_id),
          patron: await Patrons.findById(loan.patron_id),
          errors: err.errors,
          d
        });
      } else {
        console.log('return loan error', err);
        return response.sendStatus(500);
      }
    }

    // All good
    response.redirect('/loans/');
  } else {
    // Loan not found
    return response.send(404);
  }
});

// delete loan form
router.get('/:id/delete', (request, response, next) => {
  Loans.findById(request.params.id)
    .then(loan => {
      if (loan) {
        // console.log('loan', loan);
        response.render('loans/delete', { loan: loan, title: 'Delete loan' });
      } else {
        response.sendStatus(404);
      }
    })
    .catch(err => {
      console.log('THING', err);
      response.sendStatus(500);
    });
});

//delete individual loan
router.delete('/:id', (request, response, next) => {
  console.log('IN DELETE');
  Loans.findById(request.params.id)
    .then(loan => {
      if (loan) {
        console.log('in loan');
        return loan.destroy();
      } else {
        response.sendStatus(404);
        console.log('SENDING A 404!!!!!!!!!!!!!!!!!!!!!!!!!!!!', loan);
      }
    })
    .then(() => {
      response.redirect('/loans');
    })
    .catch(err => {
      console.log('loan', loan);
      console.log('THING', err);
      response.sendStatus(500);
    });
});

module.exports = router;
