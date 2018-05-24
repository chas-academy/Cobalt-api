const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const dbActions = require("../db/actions");

/* Serializing */
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  dbActions
    .getUserFromId(id)
    .then(user => done(null, user))
    .catch(err => done(err, null));
});

/* Strategies */
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    function(email, password, done) {
      dbActions
        .getUserFromEmail(email, /* withPassword */ true)
        .then(user => {
          console.log("user: ", user);
          if (!user) {
            return done(null, false, {
              type: "danger",
              message: "Incorrect username."
            });
          }

          if (!user.validPassword(password, user.password)) {
            console.log("Incorrect password");
            return done(null, false, {
              type: "danger",
              message: "Incorrect password."
            });
          }

          return done(null, user, { type: "success", message: "welcome" });
        })
        .catch(err => done(err));
    }
  )
);
