const express = require('express');
let router = express.Router();

router.get('/', (req, res) => {
    res.json({ user: req.user.getPublicProfile() });
});

module.exports = { router };