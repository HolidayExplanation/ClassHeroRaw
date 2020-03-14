const express = require('express')
const router = new express.Router()
const Admin = require('../../models/users/admin')

router.post('/recover-account', async (req, res) => {
    try {
        const admin = await Admin.findByRecoveryKey(req.body.username, req.body.recoveryKey)
       
        const token = await admin.generateAuthToken()
       
        res.status(200).send({ admin, token })
    } catch(err) {
        res.status(400).send() 
    }
})

module.exports = router