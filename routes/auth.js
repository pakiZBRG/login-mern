const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');
const { validationResult } = require('express-validator')
const { errorHandler } = require('../helpers/dbErrorHandling');
const nodemailer = require('nodemailer');
const { validLogin, validRegister, forgotPasswordValidator, resetPasswordValidator } = require('../helpers/valid');


//Create an account
router.post('/register', validRegister, (req, res) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    }
    else {
        User.findOne({email})
            .exec((err, user) => {
                //if user exists
                if(user){
                    return res.status(400).json({
                        error: "Email is taken"
                    })
                }
            })
        
        //Configuring token
        const token = jwt.sign(
            { name, email, password },
            process.env.JWT_ACCOUNT_ACTIVATION,
            { expiresIn: 3600 }
        )

        // Email data sending
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Account activation link",
            html: `
                <h3>Please Click on Link to Activate:</h3>
                <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
                <hr/>
            `
        }

        //Setting up nodemailer
        const transport = {
            host: 'smtp.gmail.com',
            auth: {
                user: 'nasa.nase72@gmail.com',
                pass: 'Nikola-990'
            }
        };
        const transporter = nodemailer.createTransport(transport);

        transporter.verify((err, success) => {
            if(err) {
                console.log(err);
            } else {
                console.log("Server is ready to take messages");
            }
        });

        //Sending mail
        transporter.sendMail(emailData, function(err, info){
            if(err) {
                console.log(err);
            } else {
                console.log(`Email send to ${info.response}`);
                return res.json({
                    message: `Email has been sent to ${email}`
                });
            }
        });
    }
});

//Activate account via gmail link
router.post('/activation',  (req, res) => {
    const {token} = req.body;
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, async (err, decoded) => {
        if(err) {
            return res.status(401).json({
                error: 'Token has expired (1hr). Login again'
            })
        } else {
            //if valid save to database
            const {name, email, password} = jwt.decode(token);
    
            const hashPassword = await bcrypt.hash(password, 10);
            const user = new User({
                name,
                email,
                password: hashPassword
            })
    
            //Put in mongoDB
            user.save()
                .then(() => {
                    res.json({
                        success: true,
                        message: 'Signup success'
                    })
                })
                .catch(err => res.status(401).json({error: errorHandler(err)}));
        }
    })
})

//Login to account
router.post('/login', validLogin,  async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    }
    else {
        //if user exists
        const user = await User.findOne({email: req.body.email});
        if(!user) return res.status(400).json({error: 'No user with given email. Please Sign up'});

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) return res.status(400).json({error: "Wrong Password"});

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {expiresIn: '10d'})

        const { _id, name, email, role } = user;
        return res.json({
            token,
            user: {
                _id, name, email, role
            }
        })
    }
});

//Forgotten password
router.put('/forgotpassword', forgotPasswordValidator, async (req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    }
    else {
        //If user with given email exists
        const user = await User.findOne({email: req.body.email});
        if(!user) return res.status(400).json({error: 'No user with given email.'});

        //Generate token for 15 minutes
        const token = jwt.sign({_id: user._id}, process.env.JWT_RESET_PASSWORD, {expiresIn: '15min'});

        //Send email with this token
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: req.body.email,
            subject: "Reset password link",
            html: `
                <h3>Please Click on Link to Reset Password:</h3>
                <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                <hr/>
            `
        }

        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if(err) {
                return res.status(400).json({ error: errorHandler(err) });
            } else {
                //Setting up nodemailer
                const transport = {
                    host: 'smtp.gmail.com',
                    auth: {
                        user: 'nasa.nase72@gmail.com',
                        pass: 'Nikola-990'
                    }
                };
                const transporter = nodemailer.createTransport(transport);

                transporter.verify((err, success) => {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("Server is ready to take messages");
                    }
                });

                //Sending mail
                transporter.sendMail(emailData, function(err, info){
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(`Email send to ${info.response}`);
                        return res.json({
                            message: `Email has been sent to ${email}`
                        });
                    }
                });
            }
        })
    }
});

//Reset password
router.put('/resetpassword', resetPasswordValidator, (req, res) => {
    const {resetPasswordLink, newPassword} = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        if(resetPasswordLink){
            jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err, decoded) {
                if(err) {
                    return res.status(400).json({ error: "Expired Link, send another one." })
                }
                User.findOne({resetPasswordLink}, async (err, user) => {
                    if(err || !user){
                        return res.status(400).json({ error: "Error occured. Try again later." });
                    }
                    
                    const newHashPassword = await bcrypt.hash(newPassword, 10);
                    const updatedUser = {
                        password: newHashPassword,
                        resetPasswordLink: ""
                    }

                    user = _.extend(user, updatedUser);
                    user.save((err, result) => {
                        if (err) {
                          return res.status(400).json({ error: 'Error resetting user password' });
                        }
                        res.json({message: 'Password successfully reseted'});
                    });
                });
            });
        }
    }
})

//Google Login
const client = new OAuth2Client(process.env.GOOGLE_CLIENT);
router.post('/googlelogin', (req, res) => {
    //Get token from request
    const {idToken} = req.body;

    client
        .verifyIdToken({idToken, audience: process.env.GOOGLE_CLIENT})
        .then(response => {
            const {email_verified, name, email} = response.payload;
            if(email_verified) {
                User.findOne({email})
                    .exec(async (err, user) => {
                        //if user with given email exists
                        if(user){
                            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {expiresIn: "7d"})
                            const { _id, email, name, role } = user;
                            return res.json({
                                token,
                                user: {_id, email, name, role}
                            })
                        } else {
                            //if user doesnt exists, it will save data in mongoDB and generate password
                            let password = email + process.env.JWT_SECRET;
                            const newPassword = await bcrypt.hash(password, 10);
                            user = new User({ 
                                name,
                                email,
                                password: newPassword
                            })

                            user.save((err, data) => {
                                if(err){
                                    return res.status(400).json({ error: 'User signup failed with Google' })
                                }
                                const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, {expiresIn: "7d"});
                                const { _id, email, name, role } = data;
                                return res.json({
                                    token,
                                    user: {_id, email, name, role}
                                })
                            })
                        }
                    })
                    
                }
                else {
                    return res.status(400).json({ error: "Google login failed. Try again!" })
                }
        });
})

//Facebook Login
router.post('/facebooklogin', (req, res) => {
    const {userID, accessToken} = req.body;
    const url = `https://graph.facebook.com/v2.11/${userID}?fields=id,name,email&access_token=${accessToken}`;

    return (
        fetch(url, { method:'GET' })
            .then(response => response.json())
            .then(response => {
                const {email, name} = response;
                User.findOne({email})
                    .exec(async (err, user) => {
                        //if user with given email exists -> Same w/ Google
                        if(user){
                            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {expiresIn: "7d"});
                            const { _id, email, name, role } = user;
                            return res.json({
                                token,
                                user: {_id, email, name, role}
                            })
                        }
                        //if user doesnt exists, it will save data in mongoDB and generate password
                        else {
                            let password = email + process.env.JWT_SECRET;
                            const newPassword = await bcrypt.hash(password, 10);
                            user = new User({ 
                                name,
                                email,
                                password: newPassword
                            })

                            user.save((err, data) => {
                                if(err){
                                    return res.status(400).json({ error: 'User signup failed with Facebook' })
                                }
                                const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, {expiresIn: "7d"});
                                const { _id, email, name, role } = data;
                                return res.json({
                                    token,
                                    user: {_id, email, name, role}
                                })
                            })
                        }
                    })
            })
            .catch(err => {
                res.json({ error: 'Facebook login Failed. Try later!' })
            })
    )
})

module.exports = router;