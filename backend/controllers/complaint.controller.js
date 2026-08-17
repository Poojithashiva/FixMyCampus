const Complaint = require('../models/complaint.model');

// @desc    Get all Campus Issues
// @route   GET /api/complaints
// @access  Private (Admin views all, Others view their own)
exports.getComplaints = async (req, res, next) => {
    try {
        let query;

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const filter = {
            $or: [
                { completedAt: { $exists : false } },
                { completedAt: null },
                { completedAt: { $gt: tenMinutesAgo } }
            ]
        };

        // If admin, show all (active). If not, only show user's Campus Issues (active)
        if (req.user.role === 'Admin') {
            query = Complaint.find(filter).populate({
                path: 'user',
                select: 'name email role department',
            });
        } else {
            query = Complaint.find({ ...filter, user: req.user.id }).populate({
                path: 'user',
                select: 'name email role department',
            });
        }

        const complaints = await query.sort('-createdAt');

        res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id).populate({
            path: 'user',
            select: 'name email role department',
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        // Make sure user is owner or admin
        if (complaint.user._id.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to view this complaint',
            });
        }

        res.status(200).json({
            success: true,
            data: complaint,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
exports.createComplaint = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;
        // Generate unique complaint ID from latest entry
        const lastComplaint = await Complaint.findOne().sort({ createdAt: -1 });
        let nextNumber = 1;

        if (lastComplaint && lastComplaint.complaintId) {
            const parts = lastComplaint.complaintId.split('-');
            if (parts.length === 3) {
                const lastNum = parseInt(parts[2]);
                if (!isNaN(lastNum)) {
                    nextNumber = lastNum + 1;
                }
            }
        }

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        req.body.complaintId = `CMP-${year}${month}-${String(nextNumber).padStart(4, '0')}`;

        // Handle file uploads
        if (req.files && req.files.length > 0) {
            req.body.evidence = req.files.map(file => file.path);
        }

        const complaint = await Complaint.create(req.body);

        res.status(201).json({
            success: true,
            data: complaint,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// @desc    Update complaint status/remarks (Admin only)
// @route   PUT /api/complaints/:id
// @access  Private/Admin
exports.updateComplaint = async (req, res, next) => {
    try {
        let complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        // Only allow admin to update status and responses
        if (req.user.role !== 'Admin') {
            return res.status(401).json({
                success: false,
                message: 'Only admins can update complaint status',
            });
        }

        // If status is being set to Completed, set completedAt timestamp
        if (req.body.status === 'Completed' && complaint.status !== 'Completed') {
            req.body.completedAt = new Date();
        } else if (req.body.status && req.body.status !== 'Completed') {
            // Unset completedAt if status is changed back from Completed
            req.body.completedAt = null;
        }

        complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: complaint,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
// @desc    Upvote a complaint
// @route   PUT /api/complaints/:id/upvote
// @access  Private
exports.upvoteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        if (!complaint.upvotes) {
            complaint.upvotes = [];
        }

        if (complaint.upvotes.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'You have already upvoted this issue',
            });
        }

        complaint.upvotes.push(req.user.id);

        await complaint.save();

        res.status(200).json({
            success: true,
            message: 'Issue upvoted successfully',
            upvotes: complaint.upvotes.length,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private/Admin
exports.deleteComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        // Make sure user is owner or admin (but usually only admin should delete)
        if (complaint.user.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this complaint',
            });
        }

        await complaint.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
