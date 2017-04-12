'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_toilet: {
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      access: {
        type: Sequelize.BOOLEAN
      },
      exist: {
        type: Sequelize.BOOLEAN
      },
      fee: {
        type: Sequelize.BOOLEAN
      },
      male: {
        type: Sequelize.BOOLEAN
      },
      female: {
        type: Sequelize.BOOLEAN
      },
      wheelchair: {
        type: Sequelize.BOOLEAN
      },
      drinking_water: {
        type: Sequelize.BOOLEAN
      },
      place_type: {
        type:   Sequelize.ENUM,
        values: ['restaurant', 'public', 'shopping center', 'gas station', 'bar']
      },
      address: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Details');
  }
};
