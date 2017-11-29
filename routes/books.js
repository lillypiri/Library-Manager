const express = require('express');
const router = express.Router();
const format = require('date-fns/format');

function d(date) {
  if (!date) return '';
  
  return format(date, 'YYYY-MM-DD');
}

const { Sequelize, Books, Loans, Patrons } = require('../models');

// Index - list all books
router.get('/', (request, response) => {
  let options = { 
    order: [['title', 'asc']],
    where: {}
  };

  // //define a where object -
  // console.log(request.query);
  if (request.query.filter === 'overdue') {
    options.include = [
      {
        model: Loans,
        where: {
          return_by: {
            [Sequelize.Op.lt]: new Date()
          },
          returned_on: null
        }
      }
    ];
  } else if (request.query.filter === 'checked_out') {
    console.log("IS THIS THING ON")
    options.include = [
      {
        model: Loans,
        where: {
          loaned_on: {
            [Sequelize.Op.ne]: null
          },
          returned_on: {
            [Sequelize.Op.eq]: null
        }
        }
      }
    ];
  }
  
  //input name = q, form method is a get.
  if (request.query.q) {
    options.where = {
      [Sequelize.Op.or]: [
        { 
          title: {
            [Sequelize.Op.like]: `%${request.query.q.toLowerCase()}%`
          }
        },
        { 
          author: {
            [Sequelize.Op.like]: `%${request.query.q.toLowerCase()}%`
          }
        }
      ]
    }
  }



  Books.findAll(options)
    .then(books => {
      response.render('books/index', { books, title: 'All Books' });
    })
    .catch(err => {
      console.log(err);
      response.sendStatus(500);
    });
});

// create book

router.post('/', function(request, response, next) {
  Books.create(request.body)
    .then(function(books) {
      response.redirect('/books/');
    })
    .catch(function(err) {
      if (err.name === 'SequelizeValidationError') {
        response.render('books/new', {
          books: Books.build(request.body),
          title: 'New book',
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
  response.render('books/new', { books: Books.build(), title: 'New book' });
});

// edit book form
router.get('/:id/edit', function(request, response, next) {
  Books.findById(request.params.id)
    .then(function(book) {
      if (book) {
        response.render('books/edit', { books: book, title: 'Edit Book Information' });
      } else {
        response.sendStatus(404);
      }
    })
    .catch(function(err) {
      response.sendStatus(500);
    });
});

// delete book form
router.get('/:id/delete', function(request, response, next) {
  Books.findById(request.params.id)
    .then(function(book) {
      if (book) {
        // console.log('book', book);
        response.render('books/delete', { book: book, title: 'Delete Book' });
      } else {
        response.sendStatus(404);
      }
    })
    .catch(function(err) {
      console.log('THING', err);
      response.sendStatus(500);
    });
});

//get an individual book
router.get('/:id', async (request, response) => {
  const [book, loans] = await Promise.all([
    Books.findById(request.params.id),
    Loans.findAll({ where: { book_id: request.params.id }, include: [{ model: Patrons }]})
  ]);
  
  if (!book) {
    return response.sendStatus(404);
  }
  
  return response.render('books/show', { title: book.title, book, loans, d });
});

// update book
router.put('/:id', function(request, response, next) {
  Books.findById(request.params.id)
    .then(function(books) {
      if (books) {
        return books.update(request.body);
      } else {
        response.send(404);
      }
    })
    .then(function(books) {
      response.redirect('/books/' + books.id);
    })
    .catch(function(err) {
      if (err.name === 'SequelizeValidationError') {
        const book = Book.build(request.body);
        books.id = request.params.id;

        response.render('books/edit', {
          books: books,
          title: 'Edit Book',
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


router.get('/:page', (req, res) => {
  let options = { order: [['title', 'asc']], where: {} };
  let limit = 10; // number of records per page
  let offset = 0;
  Books.findAndCountAll()
    .then(data => {
      let page = req.params.page; // page number
      let pages = Math.ceil(data.count / limit);
      offset = limit * (page - 1);
      Books.findAll(options)
        .then(users => {
          res.status(200).json({ result: books, count: data.count, pages: pages });
        });
    })
    .catch(function(error) {
      res.status(500).send('Internal Server Error');
    });
});

//delete individual book
router.delete('/:id', function(request, response, next) {
  console.log('IN DELETE');
  Books.findById(request.params.id)
    .then(function(book) {
      if (book) {
        console.log('in book');
        return book.destroy();
      } else {
        response.sendStatus(404);
        console.log('SENDING A 404!!!!!!!!!!!!!!!!!!!!!!!!!!!!', book);
      }
    })
    .then(function() {
      response.redirect('/books');
    })
    .catch(function(err) {
      console.log('book', book);
      console.log('THING', err);
      response.sendStatus(500);
    });
});

module.exports = router;
