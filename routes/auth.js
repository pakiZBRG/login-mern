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
                <p>This email contains sensitive info</p>
                <p>${process.env.CLIENT_URL}</p>
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
                    .catch(err => res.status(401).json({error: errorHandler(err)}));
                });
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
router.put('/forgotpassword', forgotPasswordValidator, (req,res) => {
    
});

module.exports = router;