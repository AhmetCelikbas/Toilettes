'use strict';
module.exports = function(sequelize, DataTypes) {
  var Details = sequelize.define('Details', {
    id_toilet: DataTypes.INTEGER,
    name: DataTypes.STRING,
    access: DataTypes.BOOLEAN,
    exist: DataTypes.BOOLEAN,
    fee: DataTypes.BOOLEAN,
    male: DataTypes.BOOLEAN,
    female: DataTypes.BOOLEAN,
    wheelchair: DataTypes.BOOLEAN,
    drinking_water: DataTypes.BOOLEAN,
    place_type: {
			type:   DataTypes.ENUM,
			values: ['restaurant', 'public', 'shopping center', 'gas station', 'bar']
		},
    address: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Details.belongsTo(models.Toilet, {foreignKey: 'id_toilet', as: 'Toilet'});
      }
    }
  });
  return Details;
};
