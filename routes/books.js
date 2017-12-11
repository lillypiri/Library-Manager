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
    limit: 10,
    offset: 0,
    where: {}
  };
  // console.log(request.query);
  // filters for overdue and checked out
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
    console.log('IS THIS THING ON');
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
  } else if (request.query.page) {
    console.log('pagination');
    (options.limit = 10), (options.offset = (request.query.page - 1) * options.limit);
  }

  // Search the results by title, author or genre
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
        },
        {
          genre: {
            [Sequelize.Op.like]: `%${request.query.q.toLowerCase()}%`
          }
        }
      ]
    };
  }

  Books.findAndCountAll(options)
    .then(books => {
      let bookCount = books.count;
      let pageSize = 10;
      let pages = Math.ceil(bookCount / pageSize);
      response.render('books/index', { books: books.rows, bookCount, pageSize, pages: pages, title: 'All Books' });
    })
    .catch(err => {
      console.log('findAndCountAll error', err);
      response.sendStatus(500);
    });
});

// Create a book
router.post('/', (request, response, next) => {
  Books.create(request.body)
    .then(book => {
      response.redirect('/books/');
    })
    .catch(err => {
      if (err.name === 'SequelizeValidationError') {
        response.render('books/new', {
          book: Books.build(request.body),
          title: 'New book',
          errors: err.errors
        });
      } else {
        throw err;
      }
    })
    .catch(err => {
      response.sendStatus(500);
    });
});

// Create book form
router.get('/new', (request, response, next) => {
  response.render('books/new', { book: Books.build(), title: 'New book' });
});

// Edit book form
router.get('/:id/edit', (request, response, next) => {
  Books.findById(request.params.id)
    .then(book => {
      if (book) {
        response.render('books/edit', { book, title: 'Edit Book Information' });
      } else {
        response.sendStatus(404);
      }
    })
    .catch(err => {
      response.sendStatus(500);
    });
});

// Delete book form
router.get('/:id/delete', (request, response, next) => {
  Books.findById(request.params.id)
    .then(book => {
      if (book) {
        response.render('books/delete', { book: book, title: 'Delete Book' });
      } else {
        response.sendStatus(404);
      }
    })
    .catch(err => {
      console.log('THING', err);
      response.sendStatus(500);
    });
});

// Get an individual book
router.get('/:id', async (request, response) => {
  const [book, loans] = await Promise.all([
    Books.findById(request.params.id),
    Loans.findAll({ where: { book_id: request.params.id }, include: [{ model: Patrons }] })
  ]);

  if (!book) {
    return response.sendStatus(404);
  }

  return response.render('books/show', { title: book.title, book, loans, d });
});

// Edit/update book
router.put('/:id', async (request, response) => {
  const book = await Books.findById(request.params.id);
  if (book) {
    try {
      await book.update(request.body);
    } catch (err) {
      console.log(err)
      if (err.name === 'SequelizeValidationError') {
        return response.render('books/show', {
          book,
          title: 'Edit Book',
          errors: err.errors,
          loans: await Loans.findAll({ where: { book_id: request.params.id }, include: [{ model: Patrons }] }),
          d
        });
      } else {
        return response.sendStatus(500);
      }
    }
    return response.redirect('/books');
  } else {
    return response.send(404);
  }
});

// Delete individual book
router.delete('/:id', (request, response, next) => {
  console.log('IN DELETE');
  Books.findById(request.params.id)
    .then(book => {
      if (book) {
        console.log('in book');
        return book.destroy();
      } else {
        response.sendStatus(404);
        console.log('SENDING A 404!!!!!!!!!!!!!!!!!!!!!!!!!!!!', book);
      }
    })
    .then(() => {
      response.redirect('/books');
    })
    .catch(err => {
      console.log('book', book);
      console.log('THING', err);
      response.sendStatus(500);
    });
});

module.exports = router;
