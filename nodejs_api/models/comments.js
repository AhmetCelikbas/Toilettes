'use strict';
module.exports = function(sequelize, DataTypes) {
  var Comments = sequelize.define('Comments', {
    id_toilet: DataTypes.INTEGER,
    id_user: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
    rating: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Comments.belongsTo(models.Toilet, { foreignKey: 'id' });
        Comments.belongsTo(models.User, { foreignKey: "id" });
      }
    }
  });
  return Comments;
};