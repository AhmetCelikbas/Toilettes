'use strict';
module.exports = function(sequelize, DataTypes) {
  var Toilet = sequelize.define('Toilet', {
    id_osm: DataTypes.BIGINT,
    id_user: DataTypes.INTEGER,
    lat: DataTypes.REAL,
    lng: DataTypes.REAL,
    picture: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE

  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Toilet.hasOne(models.Details, {foreignKey: 'id_toilet'});
				Toilet.hasMany(models.Comments, {foreignKey: 'id_toilet'});
      }
    }
  });
  return Toilet;
};