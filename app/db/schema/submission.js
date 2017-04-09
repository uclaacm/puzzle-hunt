const Sequelize = require('sequelize');
const config = require('../../config');

let db = new Sequelize(config.db.uri);

let Submission= db.define('submission', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	teamId: {
		type: Sequelize.INTEGER
	},
	puzzleId: {
		type: Sequelize.INTEGER,
	},
	answer: {
		type: Sequelize.STRING,
	},
	correct: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
	timestamp: {
		type: Sequelize.DATE,
		defaultValue: Sequelize.NOW
	}
}, {
	classMethods: {
		removeSubmissionsForTeam: function(id) {
			return this.destroy({ where: { teamId: id } });
		},
		submissionsForTeam: function(id) {
			return this.findAll({ where: { teamId: id } });
		}
	}
});

module.exports = Submission;
