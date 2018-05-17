import express from "express";

import passport from "passport";
import "../services/passport";

const router = express.Router();

const strip = (obj, ...props) => {
  const newObj = Object.assign({}, obj);

  props.forEach(prop => delete newObj[prop]);

  return newObj;
};

/* Auth */
router.get("/", (req, res) => {
  if (!req.user) {
    return res.json(401, {
      success: false,
      message: "You need to be logged in."
    });
  }

  res.json(200, {
    success: true,
    user: req.user
  });
});

router.post("/", passport.authenticate("local"), (req, res) => {
  if (!req.user) return;

  req.logIn(req.user, err => {
    console.log("passport.logIn", err);
  });

  res.json(200, {
    success: true,
    user: strip(req.user.toObject(), "password"),
    message: {
      type: "success",
      title: "Logged in successfully!",
      body: `Welcome back ${req.user.name} and good luck!`
    }
  });
});

router.get("/logout", function(req, res) {
  if (!req.user) return;

  req.logOut(req.user, err => {
    console.log("passport.logOut", err);
  });

  res.json(200, {
    success: true,
    message: {
      type: "success",
      title: "Logged out successfully",
      body: "You successfully logged out"
    }
  });
});

export default router;
