import dotenv from 'dotenv';
dotenv.config();
export const PORT = process.env.PORT;
export const jwt_secret = process.env.JWT_SECRET;
export const bcrypt_rounds = Number(process.env.BCRYPT_ROUNDS);
export const mail_clientId = process.env.MAIL_CLIENTID;
export const mail_clientSecret = process.env.MAIL_CLIENTSECRET;
export const mail_refreshToken = process.env.MAIL_REFRESHTOKEN;
export const mail_user = process.env.MAIL_USER;
export const mail_uri = process.env.MAIL_URI;
export const sendgrid_api_key = process.env.SENDGRID_API_KEY;
export const fronend_url = process.env.FRONTEND_URL;
export const backend_url = process.env.BACKEND_URL;
//# sourceMappingURL=environment.js.map