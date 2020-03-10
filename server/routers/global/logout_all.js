const express = require('express')
const router = new express.Router()
const auth = require('../../middleware/auth')

// Logout all (receive accountType from front-end)
router.post('/logout-all', (req, res, next) => {
    const accountType = req.body.accountType
    auth(req, res, next, accountType)
}, async (req, res) => {
    const accountType = req.body.accountType
    try {
        if (accountType === 'admin') {
            req.admin.tokens = []
            await req.admin.save()
            res.send()
        } else if (accountType === 'teacher') {
            req.teacher.tokens = []
            await req.teacher.save()
            res.send()
        } else if (accountType === 'student') {
            req.student.tokens = []
            await req.student.save()
            res.send()
        } else if (accountType === 'scheduler') {
            req.scheduler.tokens = []
            await req.scheduler.save()
            res.send()
        }
    } catch(err) {
        res.status(500).send(err)
    }
})

module.exports = router