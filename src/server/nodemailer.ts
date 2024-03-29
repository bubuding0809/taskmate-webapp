//Done by Jansonn Lim 2102990
//import node mailer
import nodemailer from 'nodemailer';

const email = process.env.EMAIL;
const pass = process.env.EMAIL_PASS;

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email,
        pass,
    },
});

export const mailOptions = {
    from: email,
    to: email, 
    subject: 'Message from TaskMate',
};