const express = require('express');
const router  = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  // console.log('flash ->',req.flash('success'));
  res.render('index',{
    successMessage: req.flash('success'),
    user: req.user,
  });
});

module.exports = router;
