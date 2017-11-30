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
  Patrons.findAll({ order: [['last_name', 'asc']] })
    .then(patrons => {
      response.render('patrons/index', { patrons });
    })
    .catch(err => {
      console.log(err);
      response.sendStatus(500);
    });
});

// Create patron
router.post('/', (request, response, next) => {
  Patrons.create(request.body)
    .then(patrons => {
      response.redirect('/patrons/');
    })
    .catch(err => {
      if (err.name === 'SequelizeValidationError') {
        response.render('patrons/new', {
          patrons: Patrons.build(request.body),
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
  response.render('patrons/new', { patrons: Patrons.build(), title: 'New patron' });
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
router.put('/:id', (request, response, next) => {
  Patrons.findById(request.params.id)
    .then(patrons => {
      if (patrons) {
        return patrons.update(request.body);
      } else {
        response.send(404);
      }
    })
    .then(patrons => {
      response.redirect('/patrons/' + patrons.id);
    })
    .catch(err => {
      if (err.name === 'SequelizeValidationError') {
        const patron = Patron.build(request.body);
        patrons.id = request.params.id;

        response.render('patrons/edit', {
          patrons: patrons,
          title: 'Edit Patron',
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
