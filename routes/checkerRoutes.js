const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const PendingScheme = require('../models/PendingScheme');
const VerifiedScheme = require('../models/VerifiedScheme');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const upload = multer();

// View all pending schemes
router.get('/pending-schemes', authenticate, authorize(['checker']), async (req, res) => {
    const schemes = await PendingScheme.find().populate('submittedBy', 'name email');
    res.json(schemes);
});

// Approve and create verified scheme
router.post('/approve-scheme/:id', authenticate, authorize(['checker']), upload.none(), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            minAge, maxAge, caste, community, religion, income,
            isPhysicallyChallenged,link_to_scheme
        } = req.body;

        const pendingScheme = await PendingScheme.findById(id);
        if (!pendingScheme) {
            return res.status(404).json({ msg: "Scheme not found" });
        }

        const newVerified = new VerifiedScheme({
            schemeName: pendingScheme.schemeName,
            description: pendingScheme.description,
            eligibility: {
                minAge: Number(minAge),
                maxAge: Number(maxAge),
                caste,
                community,
                religion,
                income: Number(income),
                isPhysicallyChallenged:
                    isPhysicallyChallenged === 'true' || isPhysicallyChallenged === 'yes' || isPhysicallyChallenged === true,
                link_to_scheme, // Added link to scheme
            },
            approvedBy: req.user.id
        });

        await newVerified.save();
        await PendingScheme.findByIdAndDelete(id);

        res.json({ msg: "Scheme verified and published" });
    } catch (error) {
        console.error("Approval error:", error);
        res.status(500).json({ msg: "Internal server error during approval" });
    }
});
// Update Checker Profile
router.put('/update/:id', authenticate, authorize(['checker']), async (req, res) => {
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
            isPhysicallyChallenged:
                req.body.isPhysicallyChallenged === 'true' || req.body.isPhysicallyChallenged === true || req.body.isPhysicallyChallenged === 'Yes',
            occupation: req.body.occupation,
            email: req.body.email,
            phone: req.body.phone,
            govEmail: req.body.govEmail,
            joiningDate: req.body.joiningDate,
            department: req.body.department
        };

        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!updatedUser) return res.status(404).json({ msg: 'Checker not found' });

        res.json({ msg: 'Checker profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Checker update error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get checker by govEmail
router.get('/profile', authenticate, authorize(['checker']), async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});

module.exports = router;
