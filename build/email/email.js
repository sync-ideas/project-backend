import sgMail from '@sendgrid/mail';
import { sendgrid_api_key } from "../config/environment.js";
sgMail.setApiKey(sendgrid_api_key);
export default async function sendEmail(email) {
    try {
        const msg = {
            to: email.to,
            from: 'sync.ideas.group@gmail.com',
            subject: email.subject,
            text: email.text,
            html: email.html,
        };
        await sgMail.send(msg);
        return { result: true };
    }
    catch (error) {
        console.error(error);
        return { result: false, error };
    }
}
//# sourceMappingURL=email.js.map