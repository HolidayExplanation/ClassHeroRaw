const express = require('express')
const router = new express.Router()
const Admin = require('../../models/users/admin')
const Scheduler = require('../../models/users/scheduler')
const School = require('../../models/school')
const ScheduleTimes = require('../../models/schedule/scheduleTimes')
const RoomList = require('../../models/roomList')
const generate = require('../../generator')

router.post('/create-admin', async (req, res) => {
    const creatorKey = req.body.creatorKey

    let adminObject = {
        ...req.body.adminObject,
        password: generate('password'),
        recoveryKey: generate('recoveryKey')
    }

    try {
        if (!(creatorKey === process.env.CREATOR_CODE)) throw new Error()
         // Create Admin Account
        const generatedUsername = await Admin.generateAdminUsername('admin', adminObject.schoolName, adminObject.city)
        adminObject.username = generatedUsername

        admin = new Admin(adminObject)
        await admin.save()

         // Create School
        const school = new School({
            name: req.body.adminObject.schoolName,
            city: req.body.adminObject.city,
            owner: admin._id
        })
        const savedSchool = await school.save()
        admin.schoolID = savedSchool._id
        await admin.save() // assign School to Admin

        // Create Scheduler Account 
        let generatedSchedulerUsername = await Admin.generateAdminUsername('planer', adminObject.schoolName, adminObject.city)

        const schedulerObject = {
            password: 'password',
            username: generatedSchedulerUsername,
            school: savedSchool._id
        }

        const scheduler = new Scheduler(schedulerObject)
        await scheduler.save()

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
        return res.status(500).send(err)
    }
})

module.exports = router