const express    = require("express");
const authRoutes = express.Router();

// User model
const User       = require("../models/user");

// Bcrypt to encrypt passwords
const bcrypt     = require("bcrypt");
const bcryptSalt = 10;

// show signupform
authRoutes.get("/signup", (req, res, next) => {
  res.render("auth/signup.ejs");
});

//signup post
authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/signup.ejs", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup.ejs", { message: "The username already exists" });
      return;
    }

    const salt     = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: username,
      password: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth/signup.ejs", { message: "Something went wrong" });
      } else {
        req.flash('success','You have been registered. Try logging in');
        res.redirect("/");
      }
    });
  });
});


//Show login form
authRoutes.get('/login', (req,res,next)=>{

  res.render('auth/login.ejs',{
    errorMessage: req.flash('error')//req.flash returns array
  });

});

authRoutes.get('/logout',(req,res,next)=>{

    req.logout();//passport method (logout no matter type method of login it was)
    req.flash('success', 'You have successfully logged out');
    res.redirect('/');
});

//login post
const passport = require('passport');
authRoutes.post("/login",
  passport.authenticate("local", {
  successReturnToOrRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  successFlash: 'You successfully logged in',
  passReqToCallback: true
}));

//Facebook login
authRoutes.get("/auth/facebook", passport.authenticate("facebook"));
authRoutes.get("/auth/facebook/callback", passport.authenticate("facebook", {
  successRedirect: "/",
  failureRedirect: "/login"
}));

//Google login
authRoutes.get("/auth/google", passport.authenticate("google", {
  scope: ["https://www.googleapis.com/auth/plus.login",
          "https://www.googleapis.com/auth/plus.profile.emails.read"]
}));

authRoutes.get("/auth/google/callback", passport.authenticate("google", {
  successRedirect: "/",
  failureRedirect: "/login"
}));

module.exports = authRoutes;
