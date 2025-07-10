const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// REGISTER ROUTE
router.post('/register', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'idProofImage', maxCount: 1 },
    { name: 'govIdCard', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            name, email, password, role, age, address, caste, religion, community,
            income, occupation, phone, idProofType, govEmail, joiningDate, department, dob,
            isPhysicallyChallenged
        } = req.body;

        console.log(caste)
        console.log(religion)
        console.log(community)

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            dob,
            age,
            address,
            caste,
            religion,
            community,
            income,
            isPhysicallyChallenged,
            occupation,
            phone,
            idProofType,
            govEmail,
            joiningDate,
            department,
            status: (role === 'user') ? 'verified' : 'pending', // users are auto-verified
            photo: req.files.photo?.[0]?.filename,
            idProofImage: req.files.idProofImage?.[0]?.filename,
            govIdCard: req.files.govIdCard?.[0]?.filename
        });

        await newUser.save();
        res.json({ msg: "Registration submitted", user: newUser });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Registration failed" });
    }
});



// LOGIN ROUTE
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid password' });

    if ((user.role === 'maker' || user.role === 'checker') && user.status !== 'verified') {
        return res.status(403).json({ msg: "Awaiting admin verification" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, 'secretKey123', { expiresIn: '3h' });
    res.json({ token, user });
});

module.exports = router;
