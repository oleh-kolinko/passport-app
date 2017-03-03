const express = require('express');
const router = express.Router();
const ensure = require('connect-ensure-login');//check if user is logged in?
const Room = require ('../models/room-model.js');

const multer = require('multer');//File uplod helper
const uploads = multer({ dest: __dirname + '/../public/uploads' });

router.get('/rooms/new', ensure.ensureLoggedIn(), (req,res,next)=>{
  res.render('rooms/new.ejs', {
    message: req.flash('success')
  });
});

router.get('/my-rooms', ensure.ensureLoggedIn() ,(req,res,next)=>{
  Room.find({ owner: req.user._id} ,(err, result)=>{
    if(err) return next(err);

    res.render('rooms/index',{
      rooms: result
    });
  });
});

router.post('/rooms',
 ensure.ensureLoggedIn(),
 // <input id='picture' type='file' name='picture'> !!!!!!!!NAME -> PICTURE
 uploads.single('picture'),
 (req, res, next) => {
  const filename = req.file.filename;
  const newRoom = new Room ({
    name:  req.body.name,
    desc:  req.body.desc,
    picture: `/uploads/${filename}`,
    owner: req.user._id   // <-- we add the user ID
  });

  newRoom.save ((err) => {
    if (err) { return next(err); }
    else {
      req.flash('success', 'Your room has been created.');
      res.redirect('/my-rooms');
    }
  });
});

module.exports = router;
