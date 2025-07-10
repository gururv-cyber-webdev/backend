const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');

// View all pending maker/checkers
router.get('/pending-users', authenticate, authorize(['admin']), async (req, res) => {
    const pending = await User.find({ role: { $in: ['maker', 'checker'] }, status: 'pending' });
    res.json(pending);
});

// Approve a maker/checker
router.post('/approve/:id', authenticate, authorize(['admin']), async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { status: 'verified' });
    res.json({ msg: "User approved" });
});

// Reject a maker/checker
router.delete('/reject/:id', authenticate, authorize(['admin']), async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User rejected and deleted" });
});

module.exports = router;
