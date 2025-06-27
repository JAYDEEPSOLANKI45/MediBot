const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
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

// Login clinic using Passport
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, clinic, info) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ message: 'Error logging in' });
        }
        
        if (!clinic) {
            return res.status(401).json({ message: info.message || 'Invalid credentials' });
        }
        
        // Log in the user
        req.login(clinic, (err) => {
            if (err) {
                console.error('Session error:', err);
                return res.status(500).json({ message: 'Error logging in' });
            }
            
            // Set session for backward compatibility
            req.session.clinicId = clinic._id;
            
            return res.json({ message: 'Logged in successfully' });
        });
    })(req, res, next);
});

// Logout clinic
router.post('/logout', isAuthenticated, (req, res) => {
    // Passport logout function
    req.logout(function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        
        // Destroy session for complete cleanup
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Error destroying session' });
            }
            res.json({ message: 'Logged out successfully' });
        });
    });
});

// Test route to check authentication status
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({
            authenticated: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email
            }
        });
    } else {
        return res.json({
            authenticated: false
        });
    }
});

module.exports = router;