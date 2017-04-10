'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        User.hasMany(models.Toilet, {foreignKey: 'id_user', as: 'Toilet' });
        User.hasMany(models.Comments, {foreignKey: 'id_user', as: 'Comments' });
      }
    }
  });
  return User;
};