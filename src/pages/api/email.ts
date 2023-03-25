// Next API ROUTE file
import { NextApiRequest, NextApiResponse } from 'next';
import { mailOptions, transporter } from './nodemailer';
import { Html } from '@react-email/html';
import { Button } from '@react-email/button';
import { Text } from '@react-email/text';
import { Hr } from '@react-email/hr';


//generate email content
const generateEmailContent = (firstName: string, lastName: string, phoneNo: string, email: string, message: string) => {
    return `
        <h1>Message from ${firstName} ${lastName}</h1>
        <p>Phone No: ${phoneNo}</p>
        <p>Email: ${email}</p>
        <p>Message: ${message}</p>

    `
    
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }
    
    const {
        firstName,
        lastName,
        phoneNo,
        email,
        message,
    }:{
        firstName: string,
        lastName: string,
        phoneNo: string,
        email: string,
        message: string,
    }  = req.body;
    
    //sendmail
    try {
        const data = req.body;
        await transporter.sendMail({
            ...mailOptions,
            subject: "Message from TaskMate",
            html: generateEmailContent(firstName, lastName, phoneNo, email, message),
        });
        res.status(200).json({ message: 'Email sent' });
    }catch (error) {
        res.status(500).json({ message: 'Email not sent' });
    }

    

}