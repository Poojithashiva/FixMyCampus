const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    complaintId: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: [
            'Classroom',
            'Lab Equipment',
            'Hostel',
            'Mess',
            'Wi-Fi',
            'Library',
            'Transport',
            'Sports Facilities',
            'Campus Cleanliness',
            'Security',
            'Other',
        ],
    },
    otherCategoryDescription: {
        type: String,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low',
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'In Progress', 'Completed'],
        default: 'Pending',
    },
    remarks: {
        type: String,
    },
    adminResponse: {
        type: String,
    },
    evidence: [{
        type: String,
    }],
    upvotes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }],

    createdAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// TTL index to delete complaint 10 minutes after completion
complaintSchema.index({ completedAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('Complaint', complaintSchema);
