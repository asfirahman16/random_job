const isRecruiter = (req, res, next) => {
  if (req.user.usertype == 'recruiter') {
    next();
  } else {
    req.flash("error", "You do not have access!");
    res.redirect("/");
  }
};

module.exports = isRecruiter;