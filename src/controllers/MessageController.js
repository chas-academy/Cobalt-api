import express from "express";
import { nodemailer } from 'nodemailer';

const sendMail = ({from, to, subject, body}) => {
  let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'xxx@xx.com',
      pass: 'xxxx'
    }
  });

  let mailOptions = {
    from,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    
    console.log('Message %s sent: %s', info.messageId, info.response);
        res.render('index');
    });
  });

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
    name: name,
    email: email,
    message: message,
  });

  sendMail({
    from: '"Cobalt" <no-reply@feed.io>',
    to: email,
    subject: 'Email from '+name,
    text: message,
  )
});

export default router;