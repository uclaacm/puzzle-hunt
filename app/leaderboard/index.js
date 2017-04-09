const express = require('express');
let Team = require('../db').Team;
let Puzzle = require('../db').Puzzle;
let Submission = require('../db').Submission;
let router = express.Router();

router.get('/', (req, res) => {
    Puzzle.findAll().then(puzzles => {
        if (puzzles.length === 0)
            throw "No puzzles";
        return { puzzles };
    }).then(d => Submission.findAll().then(submissions => {
        d.submissions = submissions;
        return d;
    })).then(d => Team.findAll().then(teams => {
        d.teams = {};
        for (let team of teams)
            d.teams[team.id] = team;
        return d;
    })).then(d => {
        let teams = {};
        let leaderboard = {
            header: d.puzzles.map(p => p.shortcode).sort(),
            scoreboard: []
        };

        for (let submission of d.submissions) {
            if (!teams[submission.teamId])
                teams[submission.teamId] = [];
            teams[submission.teamId].push(submission);
        }

        for (let teamId in teams) {
            let team = { team: d.teams[teamId].name, scores: [], totalScore: 0, lastCorrectSubmission: new Date(8640000000000000) };
            d.puzzles.forEach(puzzle => {
                let submissions = teams[teamId].filter(sub => sub.puzzleId === puzzle.id).sort((a, b) => {
                    if (a.timestamp < b.timestamp) return -1;
                    if (a.timestamp > b.timestamp) return 1;
                    return 0;
                });

                let score = { puzzle: puzzle.shortcode, attempts: 0, correct: false, timestamp: null };

                for (let i = 0; i < submissions.length; i++) {
                    score.attempts++;
                    let date = new Date(submissions[i].timestamp);
                    score.timestamp = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
                    if (submissions[i].correct) {
                        team.lastCorrectSubmission = Math.min(team.lastCorrectSubmission, submissions[i].timestamp);
                        score.correct = true;
                        break;
                    }
                }

                if (score.attempts > 0 && score.correct)
                    team.totalScore += 100 - 10*Math.max(0, score.attempts - 1);
                team.scores.push(score);
            });

            team.scores.sort((a, b) => {
                if (a.puzzle > b.puzzle) return 1;
                if (a.puzzle < b.puzzle) return -1;
                return 0;
            });
            leaderboard.scoreboard.push(team);
        }

        leaderboard.scoreboard.sort((a, b) => {
            if (a.totalScore < b.totalScore) return 1;
            if (a.totalScore > b.totalScore) return -1;
            if (a.lastCorrectSubmission > b.lastCorrectSubmission) return 1;
            if (a.lastCorrectSubmission < b.lastCorrectSubmission) return -1;
            return 0;
        });

        res.json({ leaderboard });
    }).catch(err => {
        console.log(err);
        res.json({ error: err });
    });
});


module.exports = { router };