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
        type: Sequelize.BIGINT
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
      placeType: {
        type:   Sequelize.STRING
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