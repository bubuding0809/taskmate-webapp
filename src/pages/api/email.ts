// Next API ROUTE file
import { NextApiRequest, NextApiResponse } from 'next';
import { mailOptions, transporter } from './nodemailer';

const sendEmailFunction = async (firstName: string, lastName: string, phoneNo: string, email: string, message: string) => {
    // Send email with the data
    try {
        return await new Promise((resolve, reject) => {
            setTimeout(() => {
                if (firstName === "Jann") {
                    reject("Jann is not allowed")
                }
                resolve("Email sent")
            }, 3000)
        })
     } catch (error) {
        throw new Error("Email not sent")
     }
}
//generate email content
const generateEmailContent = (firstName: string, lastName: string, phoneNo: string, email: string, message: string) => {
    return `
        <h1 className="text-red" >Message from ${firstName} ${lastName}</h1>
        <p>Phone Number: ${phoneNo}</p>
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
    } = req.body;
    
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