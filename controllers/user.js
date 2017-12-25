const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');

const Mailer = require('../lib/Mailer');


/*Maybe create Actor Controller*/
exports.publicCv = (req, res) => {
  res.render('default/layout', {
    title: 'CV',
    test: "WFT are you trying to test here?"
  });
};


exports.viewCv = (req, res) => {
  User.findOne({ slug: req.params.slug }, (err, actorCV) => {
    if (err) { return next(err); }
    if (!actorCV) {
      return res.render('landing/404',{title:'404'});
    }

    res.render('default/layout', {
      title: actorCV.profile.name,
      actorCV:actorCV
    });
  });
};

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    const slug = (req.user.slug)? req.user.slug : req.user.id;
    return res.redirect('/cv/' + slug);
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('username', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('username').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Success! You are logged in.' });
      //TODO[Tadious]: Figure out what's best
      //res.redirect(req.session.returnTo || '/public-cv');
      const slug = (req.user.slug)? req.user.slug : req.user.id;
      res.redirect('/cv/' + slug);
    });
  })(req, res, next);
};


/**
 * POST /check-slug
 * Is slug available.
 */
exports.checkSlug = (req, res) => {
  User.findOne({ slug: req.body.slug }, (err, existingUser) => {
    if (err) { return next(err); }
    
    var result = 'fail';
    var suggestions = [];
    if (!existingUser) {
      result = 'success';    
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({status:result,suggestions:suggestions}));
  });
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Create Account'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();
  //const errors = req.getValidationResult();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/home');
  }

  const user = new User({
    email: req.body.email,
    emailVerified:false,
    password: Math.random().toString(36).slice(-8), 
    slug: Boolean((Number(req.body._useslug)))? req.body.slug : '',
    profile: {
      name: req.body.firstname.concat(' ', req.body.lastname),
      firstname: req.body.firstname,
      lastname: req.body.lastname
    }
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/home');
    }
    
    const createRandomToken = crypto
      .randomBytesAsync(16)
      .then(buf => buf.toString('hex'));

    const saveUser = token => {
      user.passwordResetToken = token;
      user.passwordResetExpires = Date.now() + 3600000; // 1 hour
      user.save();
      return user;
    };

    const sendActivateAccountEmail = (user) => {
      if (!user) { return; }
      const token = user.passwordResetToken;
      const html = `You are receiving this email because you (or someone else) signed up for ActorCV.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/set-password/${token}\n\n
        Expires in 1 hour\n\n`;

      const text = `http://${req.headers.host}/set-password/${token}`;

      return Mailer.send({
        to:user.email,
        from:'ActorCV <no-reply@actorcv.me>',
        subject:'Activate your ActorCV account!!',
        html:html,
        text:text
      });
    };

    createRandomToken
      .then(saveUser)
      .then(sendActivateAccountEmail)
      .then(() => res.redirect('/welcome'))
      .catch(next);
  });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Profile information has been updated.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(token => token.kind !== provider);
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('info', { msg: `${provider} account has been unlinked.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /set-password/:token
 * Set Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot-password');
      }
      res.render('landing/set-password', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /set-password/:token
 * Process the Set password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  const resetPassword = () =>
    User
      .findOne({ passwordResetToken: req.params.token })
      .where('passwordResetExpires').gt(Date.now())
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
          return res.redirect('back');
        }
        const isActivating = !user.emailVerified;

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.emailVerified = true;
        
        //Use userId as slug if user did not set it
        if(!user.slug && isActivating)
          user.slug = user.id

        return user.save().then(() => new Promise((resolve, reject) => {
          req.logIn(user, (err) => {
            if (err) { return reject(err); }
            resolve(user, isActivating);
          });
        }));
      });

  const sendResetPasswordEmail = (user, isActivating) => {
    if (!user) { return; }
    
    var subject, text, html;
    if(isActivating) {
      subject = 'Welcome to ActorCV!';
      text = 'Welcome to ActorCV!!';
      html = '<h1>Welcome to ActorCV!!</h1>';
    } else {
      subject = 'ActorCV password has been changed!';
      text = 'ActorCV password has been changed!!!';
      html = '<h1>ActorCV password has been changed!!!</h1>';
    }

    const mailOptions = {
      to: user.email,
      from: 'ActorCV - <no-reply@actorcv.me>',
      subject: subject,
      html:html,
      text: text
    };
    return Mailer.send(mailOptions);
  };

  resetPassword()
    .then(sendResetPasswordEmail)
    .then(() => { if (!res.finished) res.redirect('/'); })
    .catch(err => next(err));
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('landing/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot-password');
  }

  const createRandomToken = crypto
    .randomBytesAsync(16)
    .then(buf => buf.toString('hex'));

  const setRandomToken = token =>
    User
      .findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Account with that email address does not exist.' });
        } else {
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
          user = user.save();
        }
        return user;
      });

  const sendForgotPasswordEmail = (user) => {
    if (!user) { return; }
    const token = user.passwordResetToken;
    const html = `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/set-password/${token}\n\n
        Expires in 1 hour\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`;

    const text = `http://${req.headers.host}/set-password/${token}`;

    Mailer.send({
      to:user.email,
      from:'ActorCV <no-reply@actorcv.me>',
      subject:'Set password link',
      html:html,
      text:text
    });
  };

  createRandomToken
    .then(setRandomToken)
    .then(sendForgotPasswordEmail)
    .then(() => res.redirect('/forgot-password'))
    .catch(next);
};
