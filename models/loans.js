'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loans = sequelize.define('Loans', {
    book_id: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: "Book ID is required"
        }
      }
    },
    patron_id: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: "Patron ID is required"
        }
      }
    },
    loaned_on: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: {
          msg: "Loaned On date is required (YYYY-MM-DD)"
        }
      }
    },
    return_by: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: {
          msg: "Return by date is required (YYYY-MM-DD)"
        }
      }
    },
    returned_on: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: {
          msg: "Returned on date is required"
        }
      }
    }
  }, {
    timestamps: false
  });

  Loans.associate = function(models) {
    Loans.belongsTo(models.Books, { foreignKey: 'book_id' });
    Loans.belongsTo(models.Patrons, { foreignKey: 'patron_id' });
  }
      
  return Loans;
};