// Modules
const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const mongoose = require("mongoose");
const {
    isLoggedIn
} = require("./helpers/auth");

// Create App
const app = express();

// Vars
const port = (process.env.port || 3000);
const JSON = require("circular-json");

// Load Routes
const ideasRoute = require("./routes/ideas");
const usersRoute = require("./routes/users");

// Passport config
require("./config/passport")(passport);

// Connect to mangoose
const db = require("./config/database");
mongoose.connect(db.mongoURL, {
        user: db.user,
        pass: db.password
    })
    .then(() => {
        console.log("Connected to MongoDB... on " + (process.env.NODE_ENV || "development") );
    })
    .catch((err) => {
        console.log("Error Conneting to DB : " + err)
    });

// Handlebars Middleware
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// BodyParser Middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Static Path
app.use(express.static(path.join(__dirname, "public")));

// Method override middleware for PUT and DELETE request
app.use(methodOverride("_method"));

// Express-session middleware
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash middleware
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.errors = req.flash("errors");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

// Index route
app.get("/", (req, res) => {
    res.render("index", {
        isHome: "active",
        isAbout: ""
    });
});

// About route
app.get("/about", (req, res) => {
    res.render("about", {
        isHome: "",
        isAbout: "active"
    });
});

// Logout route
app.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "You're logged out.");
    res.redirect("/users/login");
});

// Routes
app.use("/ideas", ideasRoute);
app.use("/users", usersRoute);

// Wildcard Routes
app.get("/*", (req, res) => {
    res.send("<h1>404 - Sorry, the requested webpage doesn't exist.</h1>");
});

// Start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});