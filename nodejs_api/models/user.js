'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        User.hasMany(models.Toilet, { foreignKey: 'id_user', as: 'Toilet' });
        User.hasMany(models.Comment, { foreignKey: 'id_user', as: 'Comment' });
      }
    }
  });
  return User;
};
