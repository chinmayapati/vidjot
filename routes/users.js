const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Get the Router Interface
const router = express.Router();

// Data Model
require("../models/User");
const User = mongoose.model("users");

// VIEW :: Login
router.get("/login", (req, res) => {
    res.render("users/login");
});

// VIEW :: Register
router.get("/register", (req, res) => {
    res.render("users/register");
});

// CRUD :: Login
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/ideas",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next);
});

// CRUD :: Register
router.post("/register", (req, res) => {
    console.log(req.body);
    let errors = [];
    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };

    User.findOne({
        email: req.body.email
    }).then(user => {
        if (user) {
            console.log("User already registered. Please login.");
            errors.push({
                text: "User already exists. Please login."
            });
            res.render("users/register", {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                confirm_password: req.body.confirm_password,
                errors: errors
            });
        } else {
            if (req.body.password != req.body.confirm_password) {
                errors.push({
                    text: "Passwords do not match."
                });
            }

            if (errors.length) {
                res.render("users/register", {
                    email: req.body.email,
                    name: req.body.name,
                    password: req.body.password,
                    confirm_password: req.body.confirm_password,
                    errors: errors
                });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;

                        // Save the record
                        new User(newUser).save().then(user => {
                                req.flash("success_msg", "You're registered in VidJot. Please login.");
                                res.redirect("/users/login");
                            })
                            .catch((err) => {
                                console.log("Error saving new user: " + err);
                                res.render("users/register", {
                                    name: req.body.name,
                                    email: req.body.email,
                                    password: req.body.password,
                                    confirm_password: req.body.confirm_password,
                                    errors: [{
                                        text: "Service not available. Please try after sometime."
                                    }]
                                });
                            });
                    });
                });
            }
        }
    });
});

router.get("/*", (req, res) => {
    res.send("<h1>404 - Sorry, the requested webpage doesn't exist.</h1>");
});

module.exports = router;