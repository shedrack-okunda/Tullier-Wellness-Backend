import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

export const generateToken = (payload, passwordReset = false) => {
    return jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: passwordReset ? process.env.PASSWORD_RESET_TOKEN_EXPIRATION : process.env.LOGIN_TOKEN_EXPIRATION})
}