import express from "express";
const sgMail = require('@sendgrid/mail');

const sendMail = (message) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);;
  sgMail.send(message)
    console.log(message)
}


const router = express.Router();

router.post("/", (req, res) => {
  const { email, name, message } = req.body;

  const data = [
    ['email', email],
    ['name', name],
    ['message', message]
  ]

  const errors = data.reduce((acc, [key, value]) => {
    if (value) {
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
    name: name,
    email: email,
    message: message,
  });

  const text = `Email: ${email}\nName: ${name}\nMessage: ${message}`;

  sendMail({
    from: '"Cobalt" <no-reply@feed.io>',
    to: process.env.MESSAGE_RECEIVER_EMAIL,
    subject: 'Email from '+name,
    text,
  });
});

export default router;