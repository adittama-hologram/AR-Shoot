const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// GET top 20 scores (sorted by time ascending - assuming lower time is better)
router.get('/', async (req, res) => {
    try {
        const scores = await Score.find().sort({ time: 1 }).limit(20);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new score
router.post('/', async (req, res) => {
    const score = new Score({
        playerName: req.body.playerName,
        time: req.body.time
    });

    try {
        const newScore = await score.save();
        res.status(201).json(newScore);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
