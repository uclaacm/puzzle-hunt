const compression = require('compression');
const bodyParser = require('body-parser');
const express = require('express');
let server = express();
let app = require('./app');

server.use(compression());

server.set('view engine', 'hbs');
server.use(express.static('www/public', { extensions: ['html'], maxAge : 1000 * 60 * 60 * 24 * 30 }));
server.use(bodyParser.json());

server.use(app.session);

app.auth.configureAuth(server);
server.use('/auth', app.auth.router);

server.use('/contest', app.auth.authenticated, app.contest.router);
server.use('/team', app.auth.authenticated, app.team.router);
server.use('/user', app.auth.authenticated, app.user.router);
server.use('/puzzle', app.auth.authenticated, app.puzzle.router);
server.use('/contest', app.auth.authenticated, app.contest.router);
server.use('/submission', app.auth.authenticated, app.submission.router);
server.use('/leaderboard', app.auth.authenticated, app.leaderboard.router);

server.use('/', app.auth.authenticated, express.static('www/private', { extensions: ['html'], maxAge : 1000 * 60 * 60 * 24 * 30 }));

server.listen(app.config.port, () => {
    console.log("Server listening on port 3000");
});
