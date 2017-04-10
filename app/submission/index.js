const express = require('express');
const config = require('../config');
let Submission = require('../db').Submission;
let Puzzle = require('../db').Puzzle;
let router = express.Router();

router.route('/').all((req, res, next) => {
    if (!req.user || req.user.teamId === -1)
        return res.json({ error: "You must in a team to view or submit submissions." });
    next();
}).get((req, res) => {
    Submission.submissionsForTeam(req.user.teamId).then(submissions => {
        if (submissions.length === 0)
            throw "No submissions for this team.";
        return submissions;
    }).then(submissions => {
        Puzzle.findAll().then(puzzles => {
            if (puzzles.length === 0)
                throw "No puzzles in the database.";
            return puzzles;
        }).then(puzzles => {
            let puzzleMap = {};
            for (let puzzle of puzzles)
                puzzleMap[puzzle.id] = puzzle;

            res.json({ submissions: submissions.filter(s => puzzleMap.hasOwnProperty(s.puzzleId)).map(s => {
                return {
                    puzzle: puzzleMap[s.puzzleId].shortcode,
                    timestamp: s.timestamp,
                    answer: s.answer,
                    correct: s.correct
                };
            })});
        });
    }).catch(err => {
        res.json({ error: err });
    });
}).post((req, res) => {
    if (!req.user || req.user.teamId === -1)
        return res.json({ error: "You must be in a team to submit." });
    
    let now = new Date();
    if (now < config.contest.start)
        return res.json({ error: "The contest has not yet begun." });
    if (now > config.contest.end)
        return res.json({ error: "The contest has ended." });
    if (!req.body.submission || !req.body.submission.puzzleId || !req.body.submission.answer)
        return res.json({ error: "Malformed request. "});
    
    let puzzleId = parseInt(req.body.submission.puzzleId);
    let answer = req.body.submission.answer;

    Puzzle.findById(puzzleId).then(puzzle => {
        if (!puzzle)
            throw "No such puzzle.";
        return Submission.create({
            puzzleId: puzzleId,
            teamId: req.user.teamId,
            answer: answer,
            correct: (answer.trim().toLowerCase() === puzzle.answer.toLowerCase())
        });
    }).then(puzzle => {
        res.json({});
    }).catch(err => {
        res.json({ error: err });    
    });
});

module.exports = { router };