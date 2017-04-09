const express = require('express');
const config = require('../config');
let Puzzle = require('../db').Puzzle;
let router = express.Router();

router.get('/', (req, res) => {
    let now = Date.now();
    if (now < config.contest.start)
        return res.json({ puzzles: [], error: "The contest has not yet begun." });
    if (now > config.contest.end)
        return res.json({ puzzles: [], error: "The contest has ended." });

    Puzzle.findAll().then(puzzles => {
        if (!puzzles || !puzzles.length || puzzles.length === 0)
            throw "No puzzles";
        res.json({ puzzles: puzzles.map(p => p.getPublicPuzzle()) });
    }).catch(err => {
        res.json({ error: err });
    });
});

module.exports = { router };