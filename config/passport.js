const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Load User Model
const User = mongoose.model("users");

module.exports = function(passport) {
  passport.use(new localStrategy({usernameField: "email"}, (email, password, done) => {
    User.findOne({email: email}).then(user => {
      if(!user) {
        console.log("No Such User");
        return done(null, false, {message: "No User Found."});
      }

      // Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch) {
          return done(null, user);
        }
        else {
          return done(null, false, {message: "Incorrect password"});
        }
      });

    });
  }));
  
  passport.serializeUser( (user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser( (id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });


}