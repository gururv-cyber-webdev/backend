const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const PendingScheme = require('../models/PendingScheme');
const User = require('../models/User');

// 🧾 Submit new scheme by Maker
router.post('/submit-scheme', authenticate, authorize(['maker']), async (req, res) => {
    const { schemeName, description, department, state, announcedDate, source, link_to_scheme } = req.body;

    const newScheme = new PendingScheme({
        schemeName,
        description,
        department,
        state,
        announcedDate,
        source,
        link_to_scheme,
        submittedBy: req.user.id
    });

    await newScheme.save();
    res.json({ msg: "Scheme submitted for review" });
});

// ✏️ Update Maker Profile by ID
router.put('/update/:id', authenticate, authorize(['maker']), async (req, res) => {
    try {
        const userId = req.params.id;

        const updateFields = {
            name: req.body.name,
            age: req.body.age,
            address: req.body.address,
            income: req.body.income,
            caste: req.body.caste,
            community: req.body.community,
            religion: req.body.religion,
            dob: req.body.dob,
            isPhysicallyChallenged: req.body.isPhysicallyChallenged,
            occupation: req.body.occupation,
            phone: req.body.phone,
            govEmail: req.body.govEmail
        };

        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!updatedUser) return res.status(404).json({ msg: 'User not found' });

        res.json({ msg: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.get('/profile', authenticate, authorize(['maker']), async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});

module.exports = router;
