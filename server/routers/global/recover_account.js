const express = require('express')
const router = new express.Router()
const Planer = require('../../models/users/planer')

router.post('/recover-account', async (req, res) => {
    try {
        const planer = await Planer.findByRecoveryKey(req.body.username, req.body.recoveryKey)
       
        const token = await planer.generateAuthToken()
       
        res.status(200).send({ planer, token })
    } catch(err) {
        res.status(400).send() 
    }
})

module.exports = router