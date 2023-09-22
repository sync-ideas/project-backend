import dotenv from 'dotenv'
dotenv.config()

export const PORT = process.env.PORT
export const jwt_secret = process.env.JWT_SECRET

export const mail_clientId = process.env.MAIL_CLIENTID
export const mail_clientSecret = process.env.MAIL_CLIENTSECRET
export const mail_refreshToken = process.env.MAIL_REFRESHTOKEN
export const mail_user = process.env.MAIL_USER
export const mail_uri = process.env.MAIL_URI
