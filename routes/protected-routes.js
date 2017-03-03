const express = require('express');
const router = express.Router();
const ensureLogin = require('connect-ensure-login');

//ONE WAY:

// router.use((req,res,next)=>{
//   if(req.user){
//     next();
//   }else{
//     res.redirect('/login');
//   }
// });

//Second WAY:

// function needsLogin (req,res,next){
//   if(req.user){
//     next();
//   }else{
//     res.redirect('/login');
//   }
// }

//Third WAY
//package
//npm install --save connect-ensure-login


router.get('/secret', ensureLogin.ensureLoggedIn() , (req,res,next)=>{
  res.send('<h1>SHHHHHHHHHHHHH it\'s secret page</h1>');
});

router.get('/kgb-files',  ensureLogin.ensureLoggedIn(), (req,res,next)=>{
  res.send('<h1>In soviet russia, files store you</h1>');
});

module.exports = router;
