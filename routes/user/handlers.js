var validInputs = require('../../lib').utils.form.isvalidUserForm
  , moment         = require('moment')
  , lib            = require('../../lib')
  , dustHelpers    = lib.dustHelpers;

// GET /:user
function getUserPage(req, res) {
  if (!req.isAuthenticated()) {
    res.send(200, 'Public user page of ' + req.params.user + '.');
  } 
  else if (req.user.name === req.params.user) {

    // TODO: this is the same as 
    // routes/user/presentations/handlers.js:listPresentations
    // refactor into a common function
    var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
    Slideshow.find({
      owner : req.user._id
    }, '_id title course lastSession lastEdit',
    function processPresentations(err, slides) {
      if (err) {
        throw err;
      }
      var slidesByCourse = null; //to evaluate as false in dustjs

      if (typeof slides != "undefined"
            && slides != null
            && slides.length > 0) {

        slidesByCourse = {};
        for (var i = 0; i < slides.length; i++) {
          var slideshow = slides[i].toJSON();
          if (!slidesByCourse.hasOwnProperty(slideshow.course)) {
            slidesByCourse[slideshow.course] = [];
          }
          slideshow.lastEdit = moment( slideshow.lastEdit)
              .format('DD.MM.YYYY HH:mm');
          slideshow.lastSession = moment( slideshow.lastSession)
              .format('DD.MM.YYYY HH:mm');
          slidesByCourse[slideshow.course].push(slideshow);
        }
      }

      var type = req.query.type && /(succes|error|info)/g.test(req.query.type) 
          ? 'alert-' + req.query.type : '';

      res.render('user', {
        username        : req.user.name,
        slidesByCourses : slidesByCourse,
        JSONIter        : dustHelpers.JSONIter,
        host            : appHost,
        port            : app.get('port'),
        id              : req.user.current,
        alert           : req.query.alert,
        type            : type,
        session         : req.user.current
      });
    });
  } else {
    res.send(200, 'Hello ' + req.user.name 
        + '! You are viewing the user page of ' + req.params.user + '.');
  }
}

function getUserSettings(req, res) {
  res.render('settings', {
    username : req.user.name,
    user : { name : req.user.name, email : req.user.email }
  });
}

function updateUserSettings(req, res) {
  var username        = req.body.inputUsername;
  var email           = req.body.inputEmail;
  var password        = req.body.inputPassword;
  var passwordConfirm = req.body.inputRePassword;
  var strict          = false;

  // Checking input validity
  var errors = validInputs(username, email, password, passwordConfirm, strict);

  if (errors !== null) {
    res.render('settings', {
      username : req.user.name,
      alert : errors.toString(),
      type  : 'error'
    }); //TODO handle errors display on page
  }

  // Checking user name uniqueness
  var User = db.model('User', schemas.userSchema);
  //Check if username already exists
  User.findOne({ name : username }, function(err, user) {
    if (user) {
      return res.render('settings', {
        username : req.user.name,
        message : 'Username already taken'
      });
    }
  });
  
  // Select fields to update
  var newValues = {}
  if(username.length > 0){
    newValues.name = username;
  }
  if(password.length > 0){
    newValues.password = password;
  }
  if(email.length > 0){
    newValues.email = email;
  }

  //update user
  var user = req.user;
  user.set(newValues);
  user.save(function(err, user) {
    if (err) res.render('settings', {
      username : req.user.name,
      user: newValues,
      alert: 'Something went wrong. Your data was not saved.',
      type: 'error'
    });
    res.render('settings', {
      username : req.user.name,
      user:  newValues,
      alert: 'Account successfully updated!',
      type: 'success'
    }); 
  });
}

module.exports = {
  getUserPage        : getUserPage,
  getUserSettings    : getUserSettings,
  updateUserSettings : updateUserSettings
}