import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import { sendMail } from '../utils/Email.js'
import { generateOtp } from '../utils/GenerateOtp.js'
import Otp from '../models/Otp.js'
import { sanitizeUser } from '../utils/SanitizeUser.js'
import { generateToken } from '../utils/GenerateToken.js'
import PasswordResetToken from '../models/PasswordResetToken.js'
import dotenv from 'dotenv'
dotenv.config()

export const signup = async (req, res) => {
    const {email, password} = req.body

    try {
        const existingUser = await User.findOne({ email })

        // if user already  exists
        if (existingUser) {
            return res.status(400).json({message: 'User already exists'})
        }

        // hashing the password
        const hashedPassword = await bcrypt.hash(password, 10)
        req.body.password = hashedPassword

        // creating new user
        const createdUser = new User(req.body)
        await createdUser.save()

        // getting secure user info
        const secureInfo = sanitizeUser(createdUser)

        // generating jwt token
        const token = generateToken(secureInfo)

        // sending jwt token in the response cookies
        res.cookie('token', token, {
            sameSite: process.env.PRODUCTION === 'true' ? 'None' : 'Lax',
            maxAge: new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000))),
            httpOnly: true,
            secure: process.env.PRODUCTION === 'true' ? true : false
        })

        res.status(201).json(sanitizeUser(createdUser))
    } catch(error) {
        return res.status(500).json({message: 'Error occurred during signup, please try again.'})
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body

    try {
        // checking if user exists or not
        const existingUser = await User.findOne({email})

        // if the user exists and password matches the hash password
        if (existingUser && (await bcrypt.compare(password, existingUser.password))) {
            // getting secure user info
            const secureInfo = sanitizeUser(existingUser)

            // generating jwt token
            const token = generateToken(secureInfo)

            // sending jwt token in the response cookies
            res.cookie('token', token, {
                sameSite: process.env.PRODUCTION === 'true' ? 'None' : 'Lax',
                maxAge: new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000))),
                httpOnly: true,
                secure: process.env.PRODUCTION === 'true' ? true : false
            })

            return res.status(200).json(sanitizeUser(existingUser))
        }

        res.clearCookie('token')
        return res.status(404).json({message: 'Invalid Credentials'})
    } catch(error) {
        res.status(500).json({message: 'Error occurred while logging in, please try again.'})
    }
}

export const verifyOtp = async (req, res) => {
    const { userId, otp } = req.body

    try {
        // checks if user id is existing in the user collection
        const isValidUserId = await User.findById(userId)

        // if user id does not exists returns a 404 response
        if (!isValidUserId) {
            return res.status(404).json({message: 'User not found, for which the otp has been generated.'})
        }

        // checks if otp exists by the user id 
        const isOtpExisting = await Otp.findOne({user: isValidUserId._id})

        // if otp does not exists then returns a 404 response
        if (!isOtpExisting) {
            return res.status(404).json({message: 'Otp not found'})
        }

        // checks if the otp is expired, if yes then deletes the otp and return response accordingly
        if (isOtpExisting.expiresAt < new Date()) {
            await Otp.findByIdAndDelete(isOtpExisting._id)
            return res.status(400).json({message: 'Otp has been expired.'})
        }

        // checks if otp is there and matches the hash value then updates the user verified status to true and returns the updated user
        if (isOtpExisting && (await bcrypt.compare(otp, isOtpExisting.otp))) {
            await Otp.findByIdAndDelete(isOtpExisting._id)
            const verifiedUser = await User.findByIdAndUpdate(isValidUserId._id, {isVerified: true}, {new: true})
            return res.status(200).json(sanitizeUser(verifiedUser))
        }

        // in default case if none of the condition matches, then return this response
        return res.status(400).json({message: 'Otp is invalid or expired'})
    } catch (error) {
        res.status(500).json({message: 'Some error occurred'})
    }
}

export const resendOtp = async (req, res) => {
    const { user } = req.body

    try {
        const existingUser = await User.findById(user)

        if (!existingUser) {
            return res.status(404).json({message: 'User not found'})
        }

        await Otp.deleteMany({user: existingUser._id})

        const otp = generateOtp()
        const hashedOtp = await bcrypt.hash(otp, 10)

        const newOtp = new Otp({user, otp: hashedOtp, expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME)})
        await newOtp.save()

        await sendMail(existingUser.email, 'OTP verification', `Your OTP is: <b>${otp}</b>`)

        res.status(201).json({message: 'OTP sent'})
    } catch (error) {
        res.status(500).json({message: 'Some error occurred while resending otp, please try again.'})
    }
}

export const forgotPassword = async (req, res) => {
    const {email} = req.body

    try {
        // checks if user provided email exists or not
        const isExistingUser = await User.findOne({email: email})

        // if email does not exists return a 404 response
        if (!isExistingUser) {
            return res.status(404).json({message: 'Provided email does not exists'})
        }

        await PasswordResetToken.deleteMany({user: isExistingUser._id})

        // if user exists, generate a password reset token
        const passwordResetToken = generateToken(sanitizeUser(isExistingUser), true)

        // hashes the token
        const hashedToken = await bcrypt.hash(passwordResetToken, 10)

        // saves hashed token in passwordResetToken collection
        newToken = new PasswordResetToken({user: isExistingUser._id, token: hashedToken, expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME)})
        await newToken.save()

        // sends the password reset link to the user's email
        await sendMail(isExistingUser.email, 'Password reset link', `<p>Dear ${isExistingUser.name},
                We received a request to reset the password for your. please use the following link to reset your password:</p>
                <p><a href=${process.env.ORIGIN}/reset-password/${isExistingUser._id}/${passwordResetToken} target='_blank'>Reset Password</a></p>
                <p>This link is valid for a limited time. If you did not request a password reset, please ignore this email. Your account security is important to us.

                Thank you,
                The Tullier Wellness Team</p>`)

        res.status(200).json({message: 'Password reset link sent to ${isExistingUser.email}'})
    } catch(error) {
        res.status(500).json({message: 'Error occurred while sending password reset email.'})
    }
}

export const resetPassword = async (req, res) => {
    const { userId, token, password } = req.body

    try {
        // checks if user exists or not
        const isExistingUser = await User.findById(userId)

        // if user does not exists then returns a 404 response
        if (!isExistingUser) {
            return res.status(404).json({message: 'User does not exists'})
        }

        // fetches the resetPassword token by the userId
        const isResetTokenExisting = await PasswordResetToken.findOne({user: isExistingUser._id})

        // if token does not exists for that userId then returns a 404 response
        if (!isResetTokenExisting) {
            return res.status(404).json({message: 'Reset link in not valid'})
        }

        // if the token has expired then deletes the token and send response accordingly
        if (isResetTokenExisting.expiresAt < new Date()) {
            await PasswordResetToken.findByIdAndDelete(isResetTokenExisting._id)
            return res.status(404).json({message: 'Reset link has been expired.'})
        }

        // if token exists and if not expired and token matches the hash, then reset the user password and deletes the token
        if (isResetTokenExisting && isResetTokenExisting.expiresAt > new Date() && (await bcrypt.compare(token, isResetTokenExisting.token))) {
            // deleting the password reset token
            await PasswordResetToken.findByIdAndDelete(isResetTokenExisting._id)

            // resets the password after hashing it
            await User.findByIdAndUpdate(isExistingUser._id, {password: await bcrypt.hash(password, 10)})
            return res.status(200).json({message: 'Password updated successfully'})
        }

        return res.status(404).json({message: 'Reset link has been expired'})
    } catch(error) {
        res.status(500).json({message: 'Error occurred while resetting the password, please try again.'})
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie('token', {
            maxAge: 0,
            sameSite: process.env.PRODUCTION === 'true' ? 'None' : 'Lax',
            httpOnly: true,
            secure: process.env.PRODUCTION === 'true' ? true : false
        })

        res.status(200).json({message: 'Logout successful'})
    } catch(error) {
        console.log(error)
    }
}

export const checkAuth = async (req, res) => {
    try {
        if (req.user) {
            const user = await User.findById(req.user._id)
            return res.status(200).json(sanitizeUser(user))
        }
    } catch(error) {
        res.sendStatus(500)
    }
}