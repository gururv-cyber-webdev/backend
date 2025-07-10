const mongoose = require('mongoose');
const { link } = require('../routes/makerRoutes');

const VerifiedSchemeSchema = new mongoose.Schema({
    schemeName: String,
    description: String,
    eligibility: {
        minAge: Number,
        maxAge: Number,
        caste: String,
        community: String,
        religion: String,
        income: Number,
        occupation: String,
        isPhysicallyChallenged: Boolean,
        link_to_scheme: String, 
        location: String
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('VerifiedScheme', VerifiedSchemeSchema);
