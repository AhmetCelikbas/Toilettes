'use strict';
module.exports = function(sequelize, DataTypes) {
  var Toilet = sequelize.define('Toilet', {
    id_osm: DataTypes.BIGINT,
    id_user: DataTypes.INTEGER,
    lat: DataTypes.REAL,
    lng: DataTypes.REAL
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Toilet.hasOne(models.Details, { foreignKey: 'id_toilet' });
				Toilet.hasMany(models.Comment, { foreignKey: 'id_toilet' });
				Toilet.belongsTo(models.User, { foreignKey: 'id_user' });
      }
    }
  });
  return Toilet;
};
