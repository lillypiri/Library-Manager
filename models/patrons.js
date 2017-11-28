'use strict';
module.exports = (sequelize, DataTypes) => {
  var Patrons = sequelize.define('Patrons', {
    first_name: {
      type:  DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "First name is required"
        }
      }
    },
    last_name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Last name is required"
        }
      }
    },
    address: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Address is required"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Email is required"
        }
      }
    },
    library_id: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Library ID is required"
        }
      }
    },
    zip_code: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: "Zip code is required"
        }
      }
    }
  }, {
    timestamps: false
  });
  
  Patrons.associate = function(models) {
    Patrons.hasMany(models.Loans, { foreignKey: 'patron_id' });
  }
  
  return Patrons;
};