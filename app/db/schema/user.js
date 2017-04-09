const Sequelize = require('sequelize');
const config = require('../../config');

let db = new Sequelize(config.db.uri);

let User = db.define('user', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	profileId: {
		type: Sequelize.STRING
	},
	profilePicture: {
		type: Sequelize.STRING
	},
	name: {
		type: Sequelize.STRING
	},
	accessToken: {
		type: Sequelize.STRING
	},
	teamId: {
		type: Sequelize.INTEGER,
		defaultValue: -1
	},
	lastLogin: {
		type: Sequelize.DATE,
		defaultValue: Sequelize.NOW
	}
}, {
	classMethods: {
		findByProfile: function(id) {
			return this.findOne({ where : { profileId : id } });
		},
		findTeamMembers: function(id) {
			return this.findAll({ where : { teamId : id }});
		}
	},

	instanceMethods: {
		getPublicProfile: function() {
			return {
				id: this.getDataValue('id'),
				profilePicture: this.getDataValue('profilePicture'),
				name: this.getDataValue('name'),
				teamId: this.getDataValue('teamId')
			};
		}
	}
});

module.exports = User;
