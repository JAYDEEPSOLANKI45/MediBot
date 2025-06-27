const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Clinic = require('../models/ClinicSchema');

// Configure the local strategy for use by Passport
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        // Find the clinic by email
        const clinic = await Clinic.findOne({ email });
        
        // If clinic doesn't exist
        if (!clinic) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        
        // Check if password is correct
        const isMatch = await bcrypt.compare(password, clinic.password);
        
        // If password doesn't match
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        
        // If everything is OK, return the clinic
        return done(null, clinic);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize clinic to store in session
passport.serializeUser((clinic, done) => {
  done(null, clinic.id);
});

// Deserialize clinic from session
passport.deserializeUser(async (id, done) => {
  try {
    const clinic = await Clinic.findById(id);
    done(null, clinic);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;