const Sequelize = require('sequelize');
const config = require('../config');

let db = new Sequelize(config.db.uri, { logging: false });

let User = require('./schema/user.js');
let Puzzle = require('./schema/puzzle.js');
let Submission = require('./schema/submission.js');
let Team = require('./schema/team.js');

User.sync();
Puzzle.sync();
Submission.sync();
Team.sync();

module.exports = { User, Puzzle, Submission, Team };
