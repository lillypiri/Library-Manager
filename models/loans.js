'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loans = sequelize.define('Loans', {
    timestamps: false,
    id: DataTypes.INTEGER,
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: DataTypes.DATE,
    return_by: DataTypes.DATE,
    returned_on: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Loans;
};