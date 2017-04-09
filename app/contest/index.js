const express = require('express');
const config = require('../config');
let router = express.Router();

router.get('/', (req, res) => {
    res.json({ contest: config.contest });
});

module.exports = { router };