const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      next()
    } else {
      req.flash("error", "You do not have access!");
      res.redirect("/signin");
    }
  };

  const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
      req.flash("error", "Already signed in");
      res.redirect("/");
    } else {
      next();
    }
  }

  module.exports = {
    ensureAuthenticated,
    isLoggedIn
  };
  