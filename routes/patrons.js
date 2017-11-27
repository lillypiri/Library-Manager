const express = require('express');
const router = express.Router();

const Patrons = require('../models').Patrons;

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
      response.sendStatus(500);
    })
})



// patron form
router.get('/new', function(request, response, next) {
  response.render("patrons/new", { patrons: Patrons.build(), title: "New patron" })
})

module.exports = router;
