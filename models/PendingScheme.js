const mongoose = require('mongoose');

const PendingSchemeSchema = new mongoose.Schema({
    schemeName: String,
    description: String,
    department: String,
    state: String,
    announcedDate: Date,
    source: String,
    link_to_scheme: String,
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PendingScheme', PendingSchemeSchema);
