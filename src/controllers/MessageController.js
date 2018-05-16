import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  const { email, name, message } = req.body;

  const data = [
    ['email', email],
    ['name', name],
    ['message', message]
  ]

  const errors = data.reduce((acc, [key, value]) => {
    if (value && value !== "bobs") {
      return acc
    }

    acc[key] = key+" is empty"
    return acc;
  }, {})

  if (Object.keys(errors).length) {
    return res.json(400, {
      success: false,
      errors,
    });
  }

  res.json(200, {
    success: true,
    name: req.name,
    email: req.email,
    message: req.message,
  });
});

export default router;