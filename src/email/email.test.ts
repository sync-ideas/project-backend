import nodemailer from 'nodemailer';
//import { google } from 'googleapis';

import { IEmail } from '../types/emailTypes.js';


;
import mailchimp from '@mailchimp/mailchimp_marketing';

// Configura Mailchimp
mailchimp.setConfig({
  apiKey: 'feb941bad02c99af4cabd2a5089ac2a8-us21',
  server: 'us-21', // e.g., 'us1', 'us2', etc.
});

// Crea un transportador Nodemailer
let transporter = nodemailer.createTransport({
  service: 'smtp.mandrillapp.com',
  port: 587,
  secure: false,
  auth: {
    user: 'SyncIdeas',
    pass: 'feb941bad02c99af4cabd2a5089ac2a8'
  }
});





/*
import { mail_user, mail_clientId, mail_clientSecret, mail_refreshToken, mail_uri } from '../config/environment.js';

const oAuth2Client = new google.auth.OAuth2(mail_clientId, mail_clientSecret, mail_uri);
oAuth2Client.setCredentials({ refresh_token: mail_refreshToken });
*/
export default async function sendEmail(email: IEmail) {
  try {
    //  const accessToken = await oAuth2Client.getAccessToken();
    /*  const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: mail_user,
          clientId: mail_clientId,
          clientSecret: mail_clientSecret,
          refreshToken: mail_refreshToken,
          accessToken: accessToken
        },
        tls: {
          rejectUnauthorized: false
        }
      });*/
    const mailOptions = {
      from: email.from,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html
    }
    const result = await transporter.sendMail(mailOptions);
    console.log(result);
    return result
  } catch (error) {
    console.log(error)
  }

}




