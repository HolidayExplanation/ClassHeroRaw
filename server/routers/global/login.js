const express = require('express')
const router = new express.Router()
const Planer = require('../../models/users/planer')

// Login all types of users
router.post('/login', async (req, res) => {
    try {
        const user = await Planer.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch(err) {
        res.status(400).send("error") 
    }
})

module.exports = router