const express = require("express");
const mongoose = require("mongoose");
const {isLoggedIn} = require("../helpers/auth");

// Get the Router Interface
const router = express.Router();

// Load Idea Model
require("../models/Idea");
const Idea = mongoose.model("ideas");

// Check if user is logged in
router.use(isLoggedIn, (req, res, next) => {
  next();
});

// VIEW :: Index
router.get("/", (req, res) => {
  Idea.find({user: req.user.id}).sort({ date: "desc" }).then(ideas => {
    console.log(`Retrieved Ideas: ${ideas.length}`);
    res.render("ideas/index", { ideas: ideas });
  });
});

// CRUD :: Add Idea
router.post("/", (req, res) => {
  let errors = [];
  if (!req.body.title) {
    errors.push({ text: "Please add a title" });
  }
  if (!req.body.details) {
    errors.push({ text: "Please add some details" });
  }

  if (errors.length > 0) {
    res.render("ideas/add", {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  }
  else {
    let newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    };
    new Idea(newUser).save().then(ideas => {
      req.flash("success_msg", "Idea Added")
      res.redirect("/ideas");
    });
  }
});

// CRUD :: Update Idea
router.put("/:id", (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    Idea.findById({ _id: req.params.id })
      .then(idea => {
        // add new values
        idea.title = req.body.title;
        idea.details = req.body.details;

        idea.save()
          .then(idea => {
            console.log("Record updated :: " + idea);
            req.flash("success_msg", "Idea Updated");
            res.redirect("/ideas");
          })
          .catch((err) => {
            console.log("Error updating the record :: " + err);
          });
      })
  }
  else {
    console.log("Not a valid ID");
    req.flash("error_msg", "Idea not found in DB");
    res.redirect("/ideas");
  }
});

// CRUD :: Delete Idea
router.delete("/:id", (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    Idea.deleteOne({ _id: req.params.id })
      .then(idea => {
        console.log("Deleted the record: " + idea);
        req.flash("success_msg", "Idea Deleted");
        res.redirect("/ideas");
      })
      .catch((err) => {
        console.log("Error deleting the record: " + err);
        req.flash("error_msg", "Please try after sometime.");
        res.redirect("/ideas");
      });
  }
  else {
    req.flash("error_msg", "Idea not found in DB");
    console.log("Not a valid ID");
    res.redirect("/ideas");
  }
});

// VIEW :: Add Idea
router.get("/add", (req, res) => {
  res.render("ideas/add");
});

// VIEW ::Edit Idea
router.get("/edit/:id", (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    Idea.findOne({ _id: req.params.id })
      .then(idea => {
        if (!idea) {
          console.log("Not a valid record.");
          res.redirect("/ideas");
        }
        else {
          res.render("ideas/edit", { idea: idea });
        }
      })
      .catch((err) => {
        console.log("Error occured in edit page : " + err);
      });
  }
  else {
    console.log("Not a valid ID");
    res.redirect("/ideas");
  }
});

// Wildcard Routes
router.get("/*", (req, res) => {
  res.send("<h1>404 - Sorry, the requested webpage doesn't exist.</h1>");
});


// EXporting the routes
module.exports = router;