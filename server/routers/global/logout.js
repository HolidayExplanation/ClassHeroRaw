const express = require('express')
const router = new express.Router()
const auth = require('../../middleware/auth')

router.post('/logout', (req, res, next) => {
    const accountType = req.body.accountType
    auth(req, res, next, accountType, req.body.authToken)
}, async (req, res) => {
    const accountType = req.body.accountType
    try {
        if (accountType === 'planer') {
            req.planer.tokens = req.planer.tokens.filter((token) => {
                return token.token !== req.token
            })
            await req.planer.save()
            res.send()
        } else if (accountType === 'teacher') {
            req.teacher.tokens = req.teacher.tokens.filter((token) => {
                return token.token !== req.token
            })
            await req.teacher.save()
            res.send()
        } else if (accountType === 'student') {
            req.student.tokens = req.student.tokens.filter((token) => {
                return token.token !== req.token
            })
            await req.student.save()
            res.send()
        }
    } catch(err) {
        res.status(500).send()
    }
})

module.exports = router