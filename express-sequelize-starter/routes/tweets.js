const express = require('express');
const { Tweet } = require('../db/models')
const { check, validationResult } = require('express-validator')
const asyncHandler = require('express-async-handler');
const { handleValidationErros } = require('../utils')
const { requireAuth } = require("../auth")

// helper functions
const tweetNotFoundError = (tweetId) => {
    const err = new Error(`Tweet with id: ${tweetId}, could not be found`)
    err.title = 'Tweet not found'
    err.status = 404
    return err
}

// custom middleware 

const tweetsValidator = [
    check('message')
        .exists({checkFalsy: true})
        .withMessage('Please provide a message, when submitting a tweet')
        .isLength({ max: 280 })
        .withMessage('Tweet cannot exceed 280 character limit')
]




const router = express.Router();

router.use(requireAuth)

// Tweet.findAll()
router.get("/", asyncHandler(async (req, res) => {
    const tweets = await Tweet.findAll()
    res.json({ tweets })
}));


// Tweet.findByPk()
router.get("/:id(\\d+)", asyncHandler(async (req, res, next) => {
    const { id: tweetId } = req.params;
    const tweet = await Tweet.findByPk(tweetId)
    if (!tweet) {
        next(tweetNotFoundError(tweetId))
    } else {
        res.json({ tweet })
    }
}));

// Tweet.create()
router.post("/", tweetsValidator, handleValidationErros, asyncHandler(async (req, res) => {
    const { message } = req.body
    const tweet = await Tweet.create({
        message
    })
    res.json( tweet )
}));

// Tweet.update()
router.put("/:id(\\d+)", tweetsValidator, handleValidationErros, asyncHandler(async (req, res) => {
    const { id: tweetId} = req.params;
    const { message } = req.body;
    const tweet = await Tweet.findByPk(tweetId)
    if (!tweet) {
        next(tweetNotFoundError(tweetId))
    } else {
        await tweet.update({
            message
        })
        res.json({ tweet })
    }
}));

// Tweet.destroy()

router.delete('/:id(\\d+)', asyncHandler(async (req, res) => {
    const {id: tweetId} = req.params
    const tweet = await Tweet.findByPk(tweetId)

    if (!tweet) {
        next(tweetNotFoundError(tweetId))
    } else {
        console.log(tweet)
        await tweet.destroy()
        res.status(204).end()
    }
}))


module.exports = router