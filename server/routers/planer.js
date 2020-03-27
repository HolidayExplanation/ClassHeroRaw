const auth = require('../middleware/auth')
const express = require('express')
const router = new express.Router()
const Planer = require('../models/users/planer')
const School = require('../models/school')
const Teacher = require('../models/users/teacher')
const Student = require('../models/users/student')
const Subject = require('../models/subject')
const Class = require('../models/class')
const ScheduleTimes = require('../models/schedule/schedule_times')
const Schedule = require('../models/schedule/schedule')
const RoomList = require('../models/room_list')
const log = console.log

router.post('/create-class', (req, res, next) => {
    auth(req, res, next, 'planer')
}, async (req, res) => {
    try {
      log(req.body)

        const _class = new Class({
            name: req.body.name,
            year: req.body.year,
            halfYear: req.body.halfYear,
            school: req.planer.schoolID,
        })

        log(_class)
        
        const savedClass = await _class.save()

        // Create Static Schedule for Class
        const schedule = new Schedule({ classID: savedClass._id })
        await schedule.save()

        return res.send(savedClass._id)
    } catch(err) {
        return res.send(err)
    }
})

router.post('/assign-class-teacher', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  const classID = req.body.classID
  const teacherID = req.body.teacherID
  try {
      const schoolClass = await Class.findById(classID)
      const teacher = await Teacher.findById(teacherID, `-_id name`)
      schoolClass.classTeacher = teacherID
      schoolClass.teacherName = teacher.name
      schoolClass.save()

      res.status(200).send(schoolClass)
  } catch(err) {
      res.status(404).send(err)
  }
})

router.post('/create-school', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async (req, res) => {
  const schoolData = req.body.data.school
  
  const school = new School({
      ...schoolData,
      owner: req.planer._id
  })
  
  try {
      const savedSchool = await school.save()
      req.planer.schoolID = savedSchool._id
      await req.planer.save()
     
      const scheduleTimes = new ScheduleTimes({ schoolID: savedSchool._id })
      await scheduleTimes.save()

      res.send()
  } catch(err) {
      res.status(400).send(err)
  }
})

router.post('/create-student-accounts', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async (req, res) => {
  const classID = req.body.classID
  const students = req.body.students

  try {
      const schoolID = req.planer.schoolID

      let student = {
        name: null,
        class: null,
        school: null,
        username: null,
        password: 'passwort'
      }
      await Promise.all(students.map(async (singleStudent) => {
        student.name = singleStudent
        student.school = schoolID
        student.class = classID
        
        // Generate Username
        await Planer.generateUsername(student.name).then(async (generatedUsername) => {
            student.username = generatedUsername
            const newStudent = new Student(student)
            await newStudent.save()
        }) 
      }))
  } catch(err) {
      res.status(500).send(err)
  }

  res.send()
})

router.post('/create-subject', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async (req, res) => {
  try {
      const subject = await new Subject({
          name: req.body.name,
          teacher: req.body.teacherID,
          school: req.planer.schoolID,
          teacherName: req.body.teacherName
      })
      await subject.save()

      // create student_data (student_data is student grades etc. for subjects, because they don't contain that)
      const students = await Student.find({ class: req.body.classID }, '_id')
      await Promise.all(students.map(async (singleStudent) => {
          
          const student_data = new StudentData({
              studentID: singleStudent._id,
              subject: subject._id,
              created: subject.created
          })
          const saved_student_data = await student_data.save()
      }))

      res.status(201).send(subject)
  } catch(err) {
      res.status(400).send(err)
  }
})

router.post('/create-teacher-accounts', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async (req, res) => {
  let teachers = req.body.teachers

  if (teachers  === []) {
      throw new Error()
  }
  try {
      const schoolID = req.planer.schoolID // for security manual find in dB
      let teacher = {
        name: null,
        school: null,
        username: null,
        password: 'passwort'
      }

      let savedTeachers = []
      await Promise.all(teachers.map(async (singleTeacher) => {
          teacher.name = singleTeacher
          teacher.school = schoolID
          // Generate Username
          await Planer.generateUsername(teacher.name).then(async (generatedUsername) => {
            teacher.username = generatedUsername
            teacher.name = singleTeacher
              try {
                  const newTeacher = new Teacher(teacher)
                  let savedTeacher = await newTeacher.save() 

                  // delete teacherObject.password
                  // delete teacherObject.school

                  savedTeachers.push(savedTeacher)
              } catch(err) {
                  return res.status(400).send(err)
              }
          })      
      }))
      // return only username
      return res.status(201).send(savedTeachers)
  } catch(err) {
      return res.status(500).send({ msg: err })
  }
})

router.get('/fetch-teacher-accounts', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  try {
    const fetchedTeachers = await Teacher.find(
      { school: req.planer.schoolID }, '_id name username'
    )

    return res.send(fetchedTeachers)
  } catch(err) {
    log(err)
    return res.send(err)
  }
})

router.post('/fetch-planer-data', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  res.send(req.planer)
})

router.post('/delete-subject', (req, res, next) => {
  auth(req, res, next, 'planer')   
}, async(req, res) => {
  const _id = req.body._id

  try {
      const deleted = await Subject.deleteOne({ _id })
  
      res.send(deleted)
  } catch(err) {
      res.send(err)
  }   

})

router.post('/fetch-teacher-manager-subjects', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  const teacherIDs = req.body.teacherIDs

  let allSubjects = []
  try {
    for await (const teacherID of teacherIDs) {
      let subjects = await Subject.find({ teacher: teacherID}, '_id name teacher')
      allSubjects.push(subjects)
    }
  } catch(err) {
      allSubjects.push([])
  }
 
  res.send(allSubjects)
})

router.patch('/assign-subject-to-class', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  const classID = req.body.classID
  const subject = req.body.subject

  try {
    await Class.updateOne(
      { _id: classID }, 
      { $push: { 
        assignedSubjects: subject}
      }
    )

    return res.send()
  } catch(err) {
    return res.send(err)
  }
})

router.post('/fetch-existing-subjects', (req, res, next) => {
  auth(req, res, next, 'planer')
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
  auth(req, res, next, 'planer')
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
  auth(req, res, next, 'planer')
}, async(req, res) => {
  const schoolID = req.planer.schoolID

  try {
    const scheduleTimes = await ScheduleTimes.find({ schoolID }, `-_id -schoolID -__v`)
    log(scheduleTimes)
    return res.status(200).send(scheduleTimes)
  } catch(err) {
    log(err)
    return res.send(err)
  }
})

router.patch('/update-schedule-times', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  const schoolID = req.planer.schoolID
  const { hoursFrom, hoursTo } = req.body

  try {
      await ScheduleTimes.findOneAndUpdate({schoolID}, { hoursFrom, hoursTo })
      return res.status(204).send()
  } catch(err) {
      return res.status(400).send(err)
  }
})

router.patch('/add-room-category', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  const category = req.body.category

  try {
    await RoomList.updateOne(
      { schoolID: req.planer.schoolID }, 
      { $push: { roomTypes: category } }
    )

    return res.send()
  } catch(err) {
    return res.send(err)
  }
})

router.get('/get-room-types', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  try {
    let roomList = await RoomList.find({schoolID: req.planer.schoolID})
    roomList = roomList[0].roomTypes

    return res.json(roomList)
  } catch(err) {
    return res.send(err)
  }
})

router.patch('/add-room', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  const name = req.body.name
  const type = req.body.type

  try {
    await RoomList.updateOne(
      { schoolID: req.planer.schoolID }, 
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
  auth(req, res, next, 'planer')
}, async(req, res) => {
  try {
    let rooms = await RoomList.find({schoolID: req.planer.schoolID})
    rooms = rooms[0].rooms

    return res.json(rooms)
  } catch(err) {
    return res.send(err)
  }
})

router.post('/delete-room', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  try {
    const roomID = req.body._id
    
    const roomList = await RoomList.find({schoolID: req.planer.schoolID})
    const rooms = roomList[0].rooms

    const index = rooms.findIndex(room => room._id == roomID)
    
    roomList[0].rooms.splice(index, 1)
    
    await RoomList.updateOne(
      { schoolID: req.planer.schoolID }, 
      { rooms: roomList[0].rooms }
    )

    return res.json(rooms)
  } catch(err) {
    return res.send(err)
  }
})

router.get('/get-classes', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  const schoolID = req.planer.schoolID

  try {
      const classes = await Class.find({ school: schoolID }, '_id name year halfYear classTeacherName')

      return res.send(classes)
  } catch(err) {
      log(err)
      return res.send(err)
  }
})

router.post('/fetch-assigned-subjects', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  const classID = req.body.classID

  try {
    let _class = await Class.findById(classID)
    const classObj = _class.toObject()

    let i = 0
    for await (const subject of _class.assignedSubjects) {
      let data = await Teacher.findById(
        subject.teacherID, `staticNotAvailable`)

      classObj.assignedSubjects[i].staticNotAvailable = data.staticNotAvailable

      i++
    }

    // log(JSON.stringify(classObj))
    
    res.json(classObj)
  } catch (err) {
    log(err)
    res.send(err)
  }
})

router.get('/fetch-teacher-accounts-scheduler', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  try {
    const teachers = await Teacher.find(
      { school: req.planer.schoolID }, `_id name username dynamicNotAvailable`
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
// router.get('/get-rooms', (req, res, next) => {
//   auth(req, res, next, 'planer')
// }, async(req, res) => {
//   try {
    
//   } catch (err) {
    
//   }
// })

router.post('/get-class-schedule', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  const classID = req.body.classID

  try {
      const schedule = await Schedule.findOne({ classID }, `days`)
      return res.status(200).send(schedule.days)
  } catch(err) {
      log(err)
      return res.status(400).send(err)
  }
})

router.post('/update-schedule', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async(req, res) => {
  const classID = req.body.classID
  const newSchedule = req.body.newSchedule
  let scheduleChanges = req.body.scheduleChanges
  log('changes', scheduleChanges)

  try {
      let oldSchedule = await Schedule.find({classID})
      oldSchedule = oldSchedule[0].days

      await Schedule.updateOne(
        { classID }, 
        { days: [...newSchedule] }
      )
      
      // delete all duplicates from the array
      scheduleChanges = scheduleChanges.filter((elem, index, self) => self.findIndex(
          (t) => {return (t.day === elem.day && t.hour === elem.hour)}) === index)


      for await (const change of scheduleChanges) {
        if (change.type === 'teacher') {

          log('old', oldSchedule[change.day][change.hour])

          if (oldSchedule[change.day][change.hour] != undefined) {
            // log('RUNS???')
            let teacherToBeFreedID = oldSchedule[change.day][change.hour].teacherID

            log('teacher to be freed', teacherToBeFreedID)

            let oldTeacher = await Teacher.findById(teacherToBeFreedID)

            //
            var index = oldTeacher.staticNotAvailable[change.day].indexOf(change.hour);
            if (index !== -1) oldTeacher.staticNotAvailable[change.day].splice(index, 1);

            const updatedStaticNotAvailable = [...oldTeacher.staticNotAvailable]

            const oldTeacherUpdated = await Teacher.updateOne(
              { _id: teacherToBeFreedID }, 
              { staticNotAvailable: updatedStaticNotAvailable },
            )

            // log('oldTeacherUpdated', oldTeacherUpdated)
          }
          
          let teacher = await Teacher.findById(change.teacherID)

          teacher.staticNotAvailable[change.day].push(change.hour)

          const updatedStaticNotAvailable = [...teacher.staticNotAvailable]

          const saved = await Teacher.updateOne(
            { _id: change.teacherID }, 
            { staticNotAvailable: updatedStaticNotAvailable },
          )

          log(saved)
        }
      }

      return res.send()
  } catch(err) {
    log(err)
      return res.status(400).send(err)
  }
})

module.exports = router