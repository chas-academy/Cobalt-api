const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const dbActions = require("../db/actions");

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  dbActions
    .getUserFromId(id)
    .then(user => done(null, user))
    .catch(err => done(err, null));
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    function(email, password, done) {
      dbActions
        .getUserFromEmail(email)
        .then(user => {
          console.log(user);
          if (!user) {
            return done(null, false, { message: "Incorrect username." });
          }

          /*
          TODO: Password-handling

          if (!user.validPassword(password)) {
            return done(null, false, { message: "Incorrect password." });
          }
          
          */

          return done(null, user);
        })
        .catch(err => {
          console.log(err);
          return done(err);
        });
    }
  )
);
