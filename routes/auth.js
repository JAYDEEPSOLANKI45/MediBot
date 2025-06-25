const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Clinic = require('../models/ClinicSchema');
const Pincode = require('../models/PincodeSchema');
const { isAuthenticated } = require('../middleware/auth');

// Register a new clinic
router.post('/register', async (req, res) => {
    try {
        const { name, address, phone, email, password } = req.body;

        // Check if clinic already exists
        const existingClinic = await Clinic.findOne({ email });
        if (existingClinic) {
            return res.status(400).json({ message: 'Clinic already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new clinic
        const clinic = new Clinic({
            name,
            address,
            phone,
            email,
            password: hashedPassword
        });

        await clinic.save();
        
        await Pincode.findOneAndUpdate(
            { pincode: clinic.address.pincode },
            { $addToSet: { clinics: clinic._id } },
            { upsert: true, new: true }
        );

        res.status(201).json({ message: 'Clinic registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering clinic' });
    }
});

// Login clinic
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find clinic by email
        const clinic = await Clinic.findOne({ email });
        if (!clinic) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, clinic.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Set session
        req.session.clinicId = clinic._id;

        res.json({ message: 'Logged in successfully' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Logout clinic
router.post('/logout', isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router;