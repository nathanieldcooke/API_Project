const express = require('express')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const { check } = require("express-validator");
const { handleValidationErros } = require('../utils')
const { getUserToken } = require('../auth')
const { User, Tweet } = require('../db/models')
const { requireAuth } = require('../auth')




const router = express.Router();

const validateUsername =
    check("username")
        .exists({ checkFalsy: true })
        .withMessage("Please provide a username");

const validateEmailAndPassword = [
    check("email")
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage("Please provide a valid email."),
    check("password")
        .exists({ checkFalsy: true })
        .withMessage("Please provide a password."),
];

router.post(
    "/",
    validateUsername,
    validateEmailAndPassword,
    handleValidationErros,
    asyncHandler(async (req, res) => {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, hashedPassword });

        const token = getUserToken(user);
        res.status(201).json({
            user: { id: user.id },
            token,
        });
    })
);

router.post(
    "/token",
    validateEmailAndPassword,
    asyncHandler(async (req, res, next) => {
        const { email, password } = req.body;
        const user = await User.findOne({
            where: {
                email,
            },
        });
        
        console.log("Hello", user.validatePassword(password))
        // TODO: Password validation and error handling
        if (!user || !user.validatePassword(password)) {
            const err = new Error("Login failed");
            err.status = 401;
            err.title = "Login failed";
            err.errors = ["The provided credentials were invalid."];
            return next(err);
        }
        // TODO: Token generation
        const token = getUserToken(user);
        res.json({ token, user: { id: user.id } });
    })
);

router.get('/:id/tweets', requireAuth, asyncHandler(async (req, res) => {
    const {id: userId} = req.params
    
    const tweets = await Tweet.findAll({
        where: {
            userId
        }
    })
    console.log('I HIT THE ROUTE YAAAAAAA!!!!!!!!', tweets)

    res.json(tweets)
}))

module.exports = router