// Preliminary settings
const express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    LocalStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    // Models
    User = require('./models/user');

mongoose.connect('mongodb://localhost/auth_demo_app');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

// Setting up Express Session
app.use(require('express-session')({
    secret: 'Rusty is the best and cutest dog in the world', // This will be used to encode and decode sessions.
    resave: false,
    saveUninitialized: false
}));

// Setting up Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes (start) ++++++++++++++++++++++++++++++
// INDEX route (RESTful) (GET)
app.get('/', (req, res) => {
    res.render('home');
});
// Secret route (not RESTful) (GET)
app.get('/secret', isLoggedIn, (req, res) => { // isLoggedIn is our middleware function.
    res.render('secret');
});
// Authentication route: Sign-Up: show sign up form (not RESTful) (GET)
app.get('/register', (req, res) => {
    res.render('register');
});
// Authentication route: Sign-Up: handling user sign up (not RESTful) (POST)
app.post('/register', (req, res) => {
    // res.send('Register POST route');
    // The password will be stored in the database as a 'hash' string (the 'salt' string is used to encode/decode the password).
    User.register(new User({ username: req.body.username}), req.body.password, (err, user) => {
        if (err) {
            console.log('ERROR: ' + err);
            return res.render('register');
        } else {
            passport.authenticate('local')(req, res, function(){ // This is the 'local' strategy. We can use 'twitter', 'facebook', etc.
                res.redirect('/secret');
            });
        }
    });
});
// Authentication route: Login: form (not RESTful) (GET)
app.get('/login', (req, res) => {
    res.render('login');
});
// Authentication route: Login: logic (not RESTful) (POST)
app.post('/login', passport.authenticate('local', { // This is called 'middleware' (a code that runs before the final callback).
        successRedirect: '/secret',
        failureRedirect: '/login'
    }), (req, res) => {
});
// Authentication route: Logout: logic (not RESTful) (GET)
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
// Routes (end) ++++++++++++++++++++++++++++++++

// Middleware function that will prevent unathenticated users to access /secret
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Starting the NodeJS server
app.listen(3000, function() {
    console.log('Serving web app on port 3000...');
});