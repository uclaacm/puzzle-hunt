const Sequelize = require('sequelize');
const config = require('../../config');

let db = new Sequelize(config.db.uri, { logging: false });

let Puzzle = db.define('puzzle', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	shortcode: {
		type: Sequelize.STRING
	},
	title: {
		type: Sequelize.STRING
	},
	text: {
		type: Sequelize.TEXT
	},
	answer: {
		type: Sequelize.TEXT
	}
}, {
	instanceMethods: {
		getPublicPuzzle: function() {
			return {
				id: this.getDataValue('id'),
				shortcode: this.getDataValue('shortcode'),
				title: this.getDataValue('title'),
				text: this.getDataValue('text')
			};
		}
	}
});

module.exports = Puzzle;
