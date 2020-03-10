const express = require('express')
const router = new express.Router()
const Admin = require('../../models/users/admin')
const Scheduler = require('../../models/users/scheduler')
const School = require('../../models/school')
const ScheduleTimes = require('../../models/schedule/scheduleTimes')
const RoomList = require('../../models/roomList')
const generate = require('../../generator')
const log = console.log

router.post('/create-admin', async (req, res) => {
    const creatorKey = req.body.creatorKey

    let adminObject = {
        ...req.body.adminObject,
        password: generate('password'),
        recoveryKey: generate('recoveryKey')
    }

    try {
        log("creator code", process.env.CREATOR_CODE)
        if (!(creatorKey === process.env.CREATOR_CODE)) throw new Error()
        log("hello")
         // Create Admin Account
        const generatedUsername = await Admin.generateAdminUsername('admin', adminObject.schoolName, adminObject.city)
        log("1")
        adminObject.username = generatedUsername
        admin = new Admin(adminObject)
        const savedAdminAccount = await admin.save() 
        log("2")
         // Create School
        const school = new School({
            name: req.body.adminObject.schoolName,
            city: req.body.adminObject.city,
            owner: admin._id
        })
        const savedSchool = await school.save()
        log("3")
        admin.schoolID = savedSchool._id
        await admin.save() // assign School to Admin
        log("4")

        // Create Scheduler Account 
        let generatedSchedulerUsername = await Admin.generateAdminUsername('planer', adminObject.schoolName, adminObject.city)

        const schedulerObject = {
            password: 'password',
            username: generatedSchedulerUsername,
            school: savedSchool._id
        }

        const scheduler = new Scheduler(schedulerObject)
        let savedSchedulerAccount = await scheduler.save()

        // Create Schedule Times
        const scheduleTimes = new ScheduleTimes({ schoolID: savedSchool._id })
        const savedScheduleTimes = await scheduleTimes.save()

        // Create Room List
        const roomList = new RoomList({ schoolID: savedSchool._id })
        const savedRoomList = await roomList.save()

        return res.status(201).send({
            admin: adminObject,
            scheduler: schedulerObject,
            scheduleTimes: savedScheduleTimes,
            roomList: savedRoomList
        })
    } catch(err) {
        log(err)
        return res.status(500).send(err)
    }
})

module.exports = router