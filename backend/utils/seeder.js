const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Only create admin if one doesn't already exist
        const existing = await User.findOne({ role: 'Admin' });

        if (existing) {
            console.log('Admin already exists, skipping seed.');
            process.exit();
        }

        await User.create({
            name: 'Admin User',
            email: 'admin@college.edu',
            password: 'password123',
            role: 'Admin',
            department: 'Administration'
        });

        console.log('Admin user created successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeder error:', err);
        process.exit(1);
    }
};

seedAdmin();
