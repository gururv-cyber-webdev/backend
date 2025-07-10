const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Route files
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const makerRoutes = require('./routes/makerRoutes');
const checkerRoutes = require('./routes/checkerRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connect 
mongoose.connect('mongodb://127.0.0.1:27017/scheme_finder', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
console.log('MongoDB connected');


const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createDefaultAdmin() {
    const adminEmail = 'admin123@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('guru123@@', 10);
        const admin = new User({
            name: 'Super Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            status: 'verified'
        });
        await admin.save();
        console.log('Default admin created successfully');
    } else {
        console.log('Admin already exists');
    }
}

createDefaultAdmin(); // Call function


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/maker', makerRoutes);
app.use('/api/checker', checkerRoutes);
app.use('/api/user', userRoutes);

// Start Server
app.listen(5000, () => console.log('Server running on port 5000'));
