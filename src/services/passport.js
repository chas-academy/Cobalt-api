const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const dbActions = require("../db/actions");

// passport.use(
//   new LocalStrategy(
//     {
//       usernameField: "email",
//       passwordField: "password"
//     },
//     (username, password, done) => {
//       dbActions
//         .getUserFromEmail(email)
//         .then(user => {
//           if (!user) {
//             return done(null, false, { message: "Incorrect username." });
//           }

//           return done(null, user);
//         })
//         .catch(err => {
//           console.log(err);
//           return done(err);
//         });
//     }
//   )
// );

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

          return done(null, user);
        })
        .catch(err => {
          console.log(err);
          return done(err);
        });
    }
  )
);
