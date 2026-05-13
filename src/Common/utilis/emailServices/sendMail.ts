import nodemailer from "nodemailer";
import { EMAIL, PASS } from "../../../config/config.service";
import Mail from "nodemailer/lib/mailer/index";

export const sendMail = async (mailOptions: Mail.Options): Promise<boolean> => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        tls: { rejectUnauthorized: false },
        auth: {
            user: EMAIL,
            pass: PASS
        },
    });

    const info = await transporter.sendMail({
        from: `SocialMedia APP <${EMAIL}>`,
        ...mailOptions
    });

    console.log("Message sent: %s", info.messageId);
    return info.accepted.length > 0 ? true : false
}

export const generateOtp = () => {
    return Math.floor(Math.random() * 900000 + 100000)
}