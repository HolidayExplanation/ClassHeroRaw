const jwt = require('jsonwebtoken')
const Admin = require('../models/users/admin')
const Teacher = require('../models/users/teacher')
const Student = require('../models/users/student')
const Scheduler = require('../models/users/scheduler')
const log = console.log

const auth = async (req, res, next, authType) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.SECRET_CODE)
        
        switch(authType) {
            case 'admin':
                const admin = await Admin.findOne({ _id: decoded._id, 'tokens.token': token })
                if (!admin) {
                    throw new Error()
                }
                req.token = token
                req.admin = admin
                break;
            case 'teacher':
                const teacher = await Teacher.findOne({ _id: decoded._id, 'tokens.token': token })
                if (!teacher) {
                    throw new Error()
                }
                req.token = token
                req.teacher = teacher
                break;
            case 'student':
                const student = await Student.findOne({ _id: decoded._id, 'tokens.token': token })
                if (!student) {
                    throw new Error()
                }
                req.token = token
                req.student = student
                break;
            case 'scheduler':
                const scheduler = await Scheduler.findOne({ _id: decoded._id, 'tokens.token': token })
                if (!scheduler) {
                    throw new Error()
                }
                req.token = token
                req.scheduler = scheduler
                break;
        }

        next()
    } catch(err) {
        console.log(err)
        res.status(401).send({error: 'Please authenticate.'})
    }
}

module.exports = auth
