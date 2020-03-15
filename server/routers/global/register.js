const express = require('express')
const router = new express.Router()
const Planer = require('../../models/users/planer')
const School = require('../../models/school')
const ScheduleTimes = require('../../models/schedule/schedule_times')
const RoomList = require('../../models/room_list')
const generate = require('../../generator')

router.post('/create-planer', async (req, res) => {
    const creatorKey = req.body.creatorKey

    let planerObj = {
        ...req.body.planerObj,
        password: generate('password'),
        recoveryKey: generate('recoveryKey')
    }

    try {
        if (!(creatorKey === process.env.CREATOR_CODE)) throw new Error()
         // Create Planer Account
        const generatedUsername = await Planer.generatePlanerUsername('planer', planerObj.schoolName, planerObj.city)
        planerObj.username = generatedUsername

        planer = new Planer(planerObj)
        await planer.save()

         // Create School
        const school = new School({
            name: req.body.planerObj.schoolName,
            city: req.body.planerObj.city,
            owner: planer._id
        })
        const savedSchool = await school.save()
        planer.schoolID = savedSchool._id
        await planer.save() // assign School to Planer

        // Create Schedule Times
        const scheduleTimes = new ScheduleTimes({ schoolID: savedSchool._id })
        const savedScheduleTimes = await scheduleTimes.save()

        // Create Room List
        const roomList = new RoomList({ schoolID: savedSchool._id })
        const savedRoomList = await roomList.save()

        return res.status(201).send({
            planer: planerObj,
            scheduleTimes: savedScheduleTimes,
            roomList: savedRoomList
        })
    } catch(err) {
        return res.status(500).send(err)
    }
})

module.exports = router