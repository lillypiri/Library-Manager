'use strict';
module.exports = (sequelize, DataTypes) => {
  var Books = sequelize.define('Books', {
    timestamps: false,
    id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    author: DataTypes.STRING,
    genre: DataTypes.STRING,
    first_published: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Books;
};