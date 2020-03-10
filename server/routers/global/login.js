const express = require('express')
const router = new express.Router()
const Admin = require('../../models/users/admin')

// Login all types of users
router.post('/login', async (req, res) => {
    try {
        const user = await Admin.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch(err) {
        res.status(400).send("error") 
    }
})

module.exports = router