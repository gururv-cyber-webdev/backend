const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const VerifiedScheme = require('../models/VerifiedScheme');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// ⚙️ Multer configuration for photo and ID proof uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });


// 👤 GET: View user profile
router.get('/profile', authenticate, authorize(['user']), async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});


// 📋 GET: View eligible schemes
router.get('/eligible-schemes', authenticate, authorize(['user']), async (req, res) => {
    const user = await User.findById(req.user.id);

    const eligibleSchemes = await VerifiedScheme.find({
        'eligibility.minAge': { $lte: user.age },
        'eligibility.maxAge': { $gte: user.age },
        'eligibility.caste': user.caste,
        'eligibility.community': user.community,
        'eligibility.religion': user.religion,
        'eligibility.income': { $gte: user.income },
        'eligibility.isPhysicallyChallenged': user.isPhysicallyChallenged
    });

    res.json(eligibleSchemes);
});


// ✏️ PUT: Update user profile
router.put(
    '/update',
    authenticate,
    authorize(['user']),
    upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'idProofImage', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const userId = req.user.id;

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
                    req.body.isPhysicallyChallenged === 'true' ||
                    req.body.isPhysicallyChallenged === true ||
                    req.body.isPhysicallyChallenged === 'Yes',
                occupation: req.body.occupation,
                phone: req.body.phone,
                email: req.body.email,
                govEmail: req.body.govEmail
            };

            if (req.files?.photo) {
                updateFields.photo = req.files.photo[0].filename;
            }

            if (req.files?.idProofImage) {
                updateFields.govIdCard = req.files.idProofImage[0].filename;
            }

            const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

            if (!updatedUser) {
                return res.status(404).json({ msg: 'User not found' });
            }

            res.json({ msg: 'Profile updated successfully', user: updatedUser });
        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({ msg: 'Server error' });
        }
    }
);

module.exports = router;
