const Sequelize = require('sequelize');
const config = require('../../config');

let db = new Sequelize(config.db.uri, { logging: false });

let User = require('./user');
let Team = db.define('team', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	name: {
		type: Sequelize.STRING
	},
	memberCount: {
		type: Sequelize.INTEGER,
		defaultValue: 1
	}
}, {
	classMethods: {
		nameExists: function(name) {
			return this.count({ where: { name }}).then(c => {
				return c !== 0;
			});
		}
	},

	instanceMethods: {
		getPublicProfile: function() {
			return User.findTeamMembers(this.getDataValue('id')).then(members => {
				return {
					id: this.getDataValue('id'),
					name: this.getDataValue('name'),
					members: members.map(m => m.getPublicProfile())
				};
			});
		},
		decrementMemberCount: function() {
			return this.decrement('memberCount');
		},
		incrementMemberCount: function() {
			return this.increment('memberCount');
		}
	}
});

module.exports = Team;
