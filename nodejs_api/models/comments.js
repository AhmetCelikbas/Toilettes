'use strict';
module.exports = function(sequelize, DataTypes) {
  var Comments = sequelize.define('Comments', {
    id_toilet: DataTypes.INTEGER,
    comment: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Comments.belongsTo(models.Toilet, {foreignKey: 'id_toilet'});
      }
    }
  });
  return Comments;
};