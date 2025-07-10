const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
        type: String,
        enum: ['user', 'maker', 'checker', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['pending', 'verified'],
        default: function () {
            return this.role === 'admin' ? 'verified' : 'pending';
        }
    },
    dob: Date,
    age: Number,
    address: String,
    caste: String,
    religion: String,
    community: String,
    income: Number,
    isPhysicallyChallenged: Boolean,
    occupation: String,
    phone: String,
    photo: String,
    idProofType: String,
    idProofImage: String,
    govEmail: String,
    govIdCard: String,
    joiningDate: Date,
    department: String
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

