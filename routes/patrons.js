const express = require('express');
const router = express.Router();
const format = require('date-fns/format');

function d(date) {
  if (!date) return '';
  
  return format(date, 'YYYY-MM-DD');
}

const {Patrons, Sequelize, Books, Loans} = require('../models');

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

// create patron
router.post('/', function(request, response, next) {
  Patrons.create(request.body)
    .then(function(patrons) {
      response.redirect('/patrons/');
    }).catch(function(err) {
      if(err.name === "SequelizeValidationError") {
        response.render('patrons/new', {
          patrons: Patrons.build(request.body), 
          title: 'New patron',
          errors: err.errors
        })
      } else {
        throw err;
      }
    })
    .catch(function(err) {
      console.log("HELLO OVER HERE", err)
      response.sendStatus(500);
    })
})

// patron form
router.get('/new', function(request, response, next) {
  response.render("patrons/new", { patrons: Patrons.build(), title: "New patron" })
})

// edit patron form
router.get('/:id/edit', function(request, response, next) {
  Patrons.findById(request.params.id)
    .then(function(patron) {
      if (patron) {
        response.render('patrons/edit', { patrons: patron, title: "Edit Patron Information" });
      } else {
        response.sendStatus(404);
      }
    })
    .catch(function(err) {
      response.sendStatus(500);
    });
});

// delete patron form
router.get("/:id/delete", function(request, response, next) {
  Patrons.findById(request.params.id)
  .then(function(patron) {
    if (patron) {
      // console.log('patron', patron);
      response.render('patrons/delete', { patron: patron, title: "Delete Patron" });
    } else {
      response.sendStatus(404);
    }
  })
  .catch(function(err) {
    console.log("THING", err)
    response.sendStatus(500);
  })
});

//get an individual patron
router.get("/:id", async (request, response) => {
  const [patron, loans] = await Promise.all([
    Patrons.findById(request.params.id),
    Loans.findAll({ where: { patron_id: request.params.id }, include: [{ model: Books }]})
  ]);
  if (patron) {
    response.render('patrons/show', { patron, loans, title: patron.title, d });
  } else {
    response.sendStatus(404)
  }
});


// update patron
router.put('/:id', function(request, response, next) {
  Patrons.findById(request.params.id)
  .then(function(patrons) {
    if (patrons) {
      return patrons.update(request.body);
    } else {
      response.send(404);
    }
  })
  .then(function(patrons) {
    response.redirect('/patrons/' + patrons.id)
  })
  .catch(function(err) {
    if (err.name === 'SequelizeValidationError') {
      const patron = Patron.build(request.body);
      patrons.id = request.params.id;

      response.render('patrons/edit', {
        patrons: patrons,
        title: "Edit Patron",
        errors: err.errors
      })
    } else {
      throw err;
    }
  })
  .catch(function(err) {
    response.sendStatus(500);
  })
})

//delete individual patron
router.delete('/:id', function(request, response, next) {
  console.log("IN DELETE")
  Patrons.findById(request.params.id)
  .then(function(patron) {
    if (patron) {
      console.log("in patron")
      return patron.destroy();
    } else {
      response.sendStatus(404);
            console.log('SENDING A 404!!!!!!!!!!!!!!!!!!!!!!!!!!!!', patron);
    }
  })
  .then(function() {
    response.redirect('/patrons');
  })
  .catch(function(err) {
          console.log('patron', patron);
    console.log('THING', err);
    response.sendStatus(500)
  })
})

module.exports = router;
