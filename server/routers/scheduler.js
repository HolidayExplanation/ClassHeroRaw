const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Teacher = require('../models/users/teacher')
const Subject = require('../models/subject')
const Class = require('../models/class')
const RoomList = require('../models/roomList')
const scheduleTimes = require('../models/schedule/scheduleTimes')
const staticSchedule = require('../models/schedule/staticSchedule')
const log = console.log

router.post('/fetch-static-schedule', (req, res, next) => {
  auth(req, res, next, 'scheduler')
}, async(req, res) => {
  const classID = req.body.classID

  try {
      const fetchedStaticSchedule = await staticSchedule.findOne({ classID }, `-_id days`)
      return res.status(200).send(fetchedStaticSchedule.days)
  } catch(err) {
      return res.status(400).send(err)
  }
})

router.post('/fetch-existing-subjects', (req, res, next) => {
  auth(req, res, next, 'scheduler')
}, async(req, res) => {
  const schoolID = req.body.schoolID

  try {
      const fetchedSubjects = await Subject.find({ schoolID },
          `_id name teacherName`)

      return res.status(200).send(fetchedSubjects)
  } catch(err) {
      return res.status(400).send(err)
  }  
})

router.post('/fetch-class-names', (req, res, next) => {
  auth(req, res, next, 'scheduler')
}, async(req, res) => {
  try {  
      const classes = await Class.find(
          { 
          school: req.body.schoolID, 
          year: new Date().getFullYear(),
          halfYear: 1
          }, 
          `_id name`
      )
      res.send(classes)
  } catch (err) {
      res.status(404).send(err)
  }
})

router.get('/fetch-schedule-times', (req, res, next) => {
  auth(req, res, next, 'scheduler')
}, async(req, res) => {
  const schoolID = req.scheduler.school

  try {
    const foundScheduleTimes = await scheduleTimes.find({ schoolID }, `-_id -schoolID -__v`)
    
    return res.status(200).send(foundScheduleTimes)
  } catch(err) {
    return res.send(err)
  }
})

router.patch('/update-schedule-times', (req, res, next) => {
  auth(req, res, next, 'scheduler')
}, async(req, res) => {
  const schoolID = req.scheduler.school
  const { hoursFrom, hoursTo } = req.body

  try {
      const savedTimes = await scheduleTimes.findOneAndUpdate({schoolID}, { hoursFrom, hoursTo })
      return res.status(204).send()
  } catch(err) {
      return res.status(400).send(err)
  }
})

router.patch('/add-room-category', (req, res, next) => {
  auth(req, res, next, 'scheduler')
}, async(req, res) => {
  const category = req.body.category

  try {
    await RoomList.updateOne(
      { schoolID: req.scheduler.school }, 
      { $push: { roomTypes: category } }
    )

    return res.send()
  } catch(err) {
    return res.send(err)
  }
})

router.get('/get-room-types', (req, res, next) => {
  auth(req, res, next, 'scheduler')
}, async(req, res) => {
  try {
    let roomList = await RoomList.find({schoolID: req.scheduler.school})
    roomList = roomList[0].roomTypes

    return res.json(roomList)
  } catch(err) {
    return res.send(err)
  }
})

router.patch('/add-room', (req, res, next) => {
  auth(req, res, next, 'scheduler')
}, async(req, res) => {
  const name = req.body.name
  const type = req.body.type

  try {
    await RoomList.updateOne(
      { schoolID: req.scheduler.school }, 
      { $push: { 
        rooms: {
          name,
          type
        }}
      }
    )

    return res.send()
  } catch(err) {
    return res.send(err)
  }
})

router.get('/get-rooms', (req, res, next) => {
  auth(req, res, next, 'scheduler')
}, async(req, res) => {
  try {
    let rooms = await RoomList.find({schoolID: req.scheduler.school})
    rooms = rooms[0].rooms

    return res.json(rooms)
  } catch(err) {
    return res.send(err)
  }
})

router.post('/delete-room', (req, res, next) => {
  auth(req, res, next, 'scheduler')
}, async(req, res) => {
  try {
    const roomID = req.body._id
    
    const roomList = await RoomList.find({schoolID: req.scheduler.school})
    const rooms = roomList[0].rooms

    const index = rooms.findIndex(room => room._id == roomID)
    
    roomList[0].rooms.splice(index, 1)
    
    await RoomList.updateOne(
      { schoolID: req.scheduler.school }, 
      { rooms: roomList[0].rooms }
    )

    return res.json(rooms)
  } catch(err) {
    return res.send(err)
  }
})

router.get('/get-classes', (req, res, next) => {
  auth(req, res, next, 'scheduler')
}, async(req, res) => {
  const schoolID = req.scheduler.school

  try {
      const classes = await Class.find({ school: schoolID }, '_id name')

      return res.send(classes)
  } catch(err) {
      log(err)
      return res.send(err)
  }
})

router.get('/fetch-teacher-accounts-scheduler', (req, res, next) => {
  auth(req, res, next, 'scheduler')
}, async(req, res) => {
  try {
    const teachers = await Teacher.find(
      { school: req.scheduler.school }, `_id name username dynamicNotAvailable`
    )

    let teachersWithSubjects = []
    await Promise.all(teachers.map(async (teacher) => {
      let subjects = await Subject.find(
        { teacher: teacher._id }, '_id name'
      )

      log(teacher)
      
      let teacherObj = {
        name: teacher.name,
        _id: teacher._id,
        username: teacher.username,
        dynamicNotAvailable: teacher.dynamicNotAvailable,
        subjects
      }

      teachersWithSubjects.push(teacherObj)
    }))

    return res.send(teachersWithSubjects)
  } catch(err) {
    log(err)
    return res.send(err)
  }
})

// Wait until we have a Static Schedule where Rooms and Teachers are made unavailable.
router.get('/get-rooms', (req, res, next) => {
  auth(req, res, next, 'scheduler')
}, async(req, res) => {
  try {
    
  } catch (err) {
    
  }
})

module.exports = router