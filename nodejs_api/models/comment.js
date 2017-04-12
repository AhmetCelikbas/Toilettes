'use strict';
module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define('Comment', {
    id_toilet: DataTypes.INTEGER,
    id_user: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
    rating: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Comment.belongsTo(models.Toilet, {foreignKey: 'id_toilet'});
        Comment.belongsTo(models.User, {foreignKey: 'id_user'});
      }
    }
  });
  return Comment;
};
