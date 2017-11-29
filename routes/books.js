const express = require('express');
const router = express.Router();

const { Sequelize, Books, Loans } = require('../models');

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
  
  if (request.query.q) {
    options.where.title = {
      [Sequelize.Op.like]: `%${request.query.q.toLowerCase()}%`
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
router.get('/:id', function(request, response, next) {
  Books.findById(request.params.id)
    .then(function(book) {
      if (book) {
        response.render('books/show', { book: book, title: book.title });
      } else {
        response.sendStatus(404);
      }
    })
    .catch(function(err) {
      console.log('THING', err);
      response.sendStatus(500);
    });
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
