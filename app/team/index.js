const express = require('express');
let Team = require('../db').Team;
let Submission = require('../db').Submission;
let router = express.Router();

router.get('/', (req, res) => {
    if (!req.user || !req.user.teamId || req.user.teamId === -1)
        return res.json({ team: null, error: "You are not on a team." });

    Team.findById(req.user.teamId).then(team => {
        if (!team)
            return res.json({ team : null, error: "No such team exists." });
        return team.getPublicProfile();
    }).then(team => {
        res.json({ team: team });
    }).catch(err => {
        console.log(err);
        return res.json({ team: null, error: err });
    });
});

router.post('/leave', (req, res) => {
    if (!req.user || !req.user.teamId || req.user.teamId === -1)
        return res.json({ error: "You are not in a team." });
    
    Team.findById(req.user.teamId).then(team => {
        if (!team)
            throw "No such team exists.";
        if (team.memberCount === 1) {
            Submission.removeSubmissionsForTeam(team.id);
            team.destroy();
        } else {
            return team.decrementMemberCount();
        }
    }).then(() => req.user.update({
            teamId: -1
    })).then(() => {
        res.json({ error: null });
    }).catch(err => {
        console.log(err);
        res.json({ error: err });
    });
});

router.post('/create', (req, res) => {
    if (!req.user || !req.user.teamId)
        return res.json({ team: null, error: "You must be logged in." });
    if (req.user.teamId !== -1)
        return res.json({ team: null, error: "You are already in a team." });
    if (!req.body || !req.body.team || !req.body.team.name)
        return res.json({ team: null, error: "Malformed request." });

    Team.nameExists(req.body.team.name).then(exists => {
        if (exists)
            throw "A team with that name already exists.";
    }).then(() => Team.create({
            name: req.body.team.name
    })).then(team => team.getPublicProfile()).then(team => {
        return req.user.update({
            teamId: team.id
        }).then(user => {
            res.json({ team: team });
        });
    }).catch(err => {
        console.log(err);
        res.json({ team: null, error: err });
    });
});

router.post('/join', (req, res) => {
    if (!req.user || !req.user.teamId)
        return res.json({ team: null, error: "You must be logged in." });
    if (req.user.teamId !== -1)
        return res.json({ team: null, error: "You are already in a team." });
    if (!req.body || !req.body.team || !req.body.team.id)
        return res.json({ team: null, error: "Malformed request." });
    
    Team.findById(req.body.id).then(team => {
        if (!team)
            throw "No such team exists.";
        if (team.memberCount >= 4)
            throw "This team already has the maximum number of participants.";
        return team.incrementMemberCount();
    }).then(team => team.getPublicProfile()).then(team => {
        return req.user.update({
            teamId: team.id
        }).then(user => {
            res.json({ team: team, error: null });
        });
    }).catch(err => {
        console.log(err);
        res.json({ team: null, error: err });
    });
});

module.exports = { router };