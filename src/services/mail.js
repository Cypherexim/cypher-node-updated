import { createTransport } from "nodemailer";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

import environment from "../config/environment.js";

const ses = new SESClient({region: environment?.region});

export const SendEmail = async (toEmail, Subject, Message, carbonCopy="") => {    
    const transporter = createTransport({
        host: environment?.mail?.mailSMTP,
        port: 465,
        secure: true,
        auth: { user: environment?.mail?.fromEmail, pass: environment?.mail?.fromPassword }
    });

    const mailOptions = {
        from: environment?.mail?.fromEmail,
        to: toEmail,
        subject: Subject,
        text: Message,
        bcc: environment?.mail?.fromEmail,
        cc: carbonCopy
    };

    transporter?.sendMail(mailOptions, (error, info) => {
        if (error) { console.log(error); } 
        else { console.log('Email sent: ' + info?.response); }
    });
}

export const sendDownloadingLinkMail = async(toEmail, Subject, htmlBody, carbonCopy="") => {
    const transporter = createTransport({
        host: environment?.mail?.mailSMTP,
        port: 465,
        secure: true,
        auth: { user: environment?.mail?.fromEmail, pass: environment?.mail?.fromPassword }
    });

    const mailOptions = {
        from: environment?.mail?.fromEmail,
        to: toEmail,
        subject: Subject,
        html: htmlBody,
        bcc: environment?.mail?.fromEmail,
        cc: carbonCopy
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if(!error) return `'Email sent: ${info?.response}`;
        else console.log(error);
    });
}

export const sendSESEmail = async(email, data, subject, sourceemail) => {
    const sesParams = {
        Source: sourceemail,
        Destination: { ToAddresses: [email] },
        Message: {
            Body: { Html: { Data: data, Charset: 'UTF-8' } },
            Subject: { Data: subject }
        }
    };

    return await ses?.send(new SendEmailCommand(sesParams));
};
