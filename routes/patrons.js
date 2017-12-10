const express = require('express');
const router = express.Router();
const format = require('date-fns/format');

function d(date) {
  if (!date) return '';

  return format(date, 'YYYY-MM-DD');
}

const { Patrons, Sequelize, Books, Loans } = require('../models');

// Index - list all patrons
router.get('/', (request, response) => {
  let options = {
    order: [['last_name', 'asc']],
    limit: 10,
    offset: 0,
    where: {}
  };

  if (request.query.page) {
    console.log('pagination');
    options.limit = 10;
    options.offset = (request.query.page - 1) * options.limit;
  }

  if (request.query.q) {
    options.where = {
      [Sequelize.Op.or]: [
        {
          first_name: {
            [Sequelize.Op.like]: `%${request.query.q.toLowerCase()}%`
          }
        },
        {
          last_name: {
            [Sequelize.Op.like]: `%${request.query.q.toLowerCase()}%`
          }
        },
        {
          library_id: {
            [Sequelize.Op.like]: `%${request.query.q.toLowerCase()}%`
          }
        }
      ]
    };
  }

  Patrons.findAndCountAll(options)
    .then(patrons => {
      let patronCount = patrons.count;
      let pageSize = 10;
      let pages = Math.ceil(patronCount / pageSize);
      response.render('patrons/index', {
        patrons: patrons.rows,
        patronCount,
        pageSize,
        pages: pages,
        title: 'All Patrons'
      });
    })
    .catch(err => {
      console.log(err);
      response.sendStatus(500);
    });
});

// Create patron
router.post('/', (request, response, next) => {
  Patrons.create(request.body)
    .then(patron => {
      response.redirect('/patrons/');
    })
    .catch(err => {
      if (err.name === 'SequelizeValidationError') {
        response.render('patrons/new', {
          patron: Patrons.build(request.body),
          title: 'New patron',
          errors: err.errors
        });
      } else {
        throw err;
      }
    })
    .catch(err => {
      console.log('HELLO OVER HERE', err);
      response.sendStatus(500);
    });
});

// Patron form
router.get('/new', (request, response, next) => {
  try {
    response.render('patrons/new', { patron: Patrons.build(), title: 'New patron' });
  } catch (err) {
    console.log(err);
  }
});

// Edit patron form
router.get('/:id/edit', (request, response, next) => {
  Patrons.findById(request.params.id)
    .then(patron => {
      if (patron) {
        response.render('patrons/edit', { patrons: patron, title: 'Edit Patron Information' });
      } else {
        response.sendStatus(404);
      }
    })
    .catch(err => {
      response.sendStatus(500);
    });
});

// Delete patron form
router.get('/:id/delete', (request, response, next) => {
  Patrons.findById(request.params.id)
    .then(patron => {
      if (patron) {
        // console.log('patron', patron);
        response.render('patrons/delete', { patron: patron, title: 'Delete Patron' });
      } else {
        response.sendStatus(404);
      }
    })
    .catch(err => {
      console.log('delete patron form', err);
      response.sendStatus(500);
    });
});

// Get an individual patron
router.get('/:id', async (request, response) => {
  const [patron, loans] = await Promise.all([
    Patrons.findById(request.params.id),
    Loans.findAll({ where: { patron_id: request.params.id }, include: [{ model: Books }] })
  ]);
  if (patron) {
    response.render('patrons/show', { patron, loans, title: patron.title, d });
  } else {
    response.sendStatus(404);
  }
});

// Edit/update patron
router.put('/:id', async (request, response, next) => {
  const patron = await Patrons.findById(request.params.id);
  if (patron) {
    try {
      await patron.update(request.body);
    } catch (err) {
      console.log(err);
      if (err.name === 'SequelizeValidationError') {
        const loans = await Loans.findAll({ where: { patron_id: patron.id }, include: [{ model: Books }] });
        return response.render('patrons/show', {
          patron,
          loans,
          title: 'Edit Patron',
          errors: err.errors,
          d
        });
      } else {
        return response.sendStatus(500);
      }
    }
    return response.redirect('/patrons/');
  } else {
    return response.send(404);
  }
});

// Delete individual patron
router.delete('/:id', (request, response, next) => {
  console.log('IN DELETE');
  Patrons.findById(request.params.id)
    .then(patron => {
      if (patron) {
        return patron.destroy();
      } else {
        response.sendStatus(404);
      }
    })
    .then(() => {
      response.redirect('/patrons');
    })
    .catch(err => {
      console.log('deleting a patron error', err);
      response.sendStatus(500);
    });
});

module.exports = router;
