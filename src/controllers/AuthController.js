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
router.get("/", passport.authenticate("local"), (req, res) => {
  res.json(200, {
    user: req.user
  });
});

router.post("/", passport.authenticate("local"), (req, res) => {
  if (!req.user) return;

  res.json(200, {
    success: true,
    user: strip(req.user.toObject(), "password")
  });
});

export default router;
