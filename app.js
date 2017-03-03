const express      = require('express');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const layouts      = require('express-ejs-layouts');
const mongoose     = require('mongoose');

const flash        = require('connect-flash');
//FOR AUTHORIZATION (LOGIN AND SIGNUP):
const session      = require('express-session');
const passport     = require('passport');
const LocalStrategy= require('passport-local').Strategy;
const FbStrategy   = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const bcrypt       = require('bcrypt');

//env vars for secrets
const dotenv       = require('dotenv');
dotenv.config();

const User         = require('./models/user.js');
//------------------------------------------------

//Conncet DB:
// mongoose.connect('mongodb://localhost/passport-app');
mongoose.connect(process.env.MONGODB_URI);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);

//FOR AUTHORIZATION login and signup
app.use(session({
  secret: 'secret word different for every ',
  resave: true,
  saveUninitialized: true
}));

app.use(flash()); //Init pop up messages

app.use(passport.initialize());
app.use(passport.session());

//Local strategy (classic usertname and password)
passport.use(new LocalStrategy((username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));

//Facebook Strategy ( NOT FINAL )
passport.use(new FbStrategy({
  clientID: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET,
  callbackURL: process.env.HOST_ADDRESS +  "/auth/facebook/callback"
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile);
}));
//Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.G_CLIENT_ID,
  clientSecret: process.env.G_CLIENT_SECRET,
  callbackURL: process.env.HOST_ADDRESS + "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile);
}));


//What to save in session while login
passport.serializeUser((user, cb) => {
  if(user.provider){//Check if there is provider(facebook, google ...)
    cb(null,user);
  }else{
    cb(null, user._id);//Save only 'id' if it is local
  }
});

//What to get from session
passport.deserializeUser((id, cb) => {
  if(id.provider){
    cb(null,id);
  }else{
    User.findOne({ "_id": id }, (err, user) => {
      if (err) { return cb(err); }
      cb(null, user);
    });
  }
});

//-------------------------ROUTES GOES HERE:

const index = require('./routes/index');
app.use('/', index);

const authRoutes = require('./routes/auth-routes.js');
app.use('/', authRoutes);

const protectedRoutes = require('./routes/protected-routes.js');
app.use('/', protectedRoutes);

const roomsRoutes = require('./routes/rooms-routes.js');
app.use('/', roomsRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
