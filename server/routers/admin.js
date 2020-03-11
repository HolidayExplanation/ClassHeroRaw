const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Admin = require('../models/users/admin')
const School = require('../models/school')
const Scheduler = require('../models/users/scheduler')
const Teacher = require('../models/users/teacher')
const Student = require('../models/users/student')
const Subject = require('../models/subject')
const Class = require('../models/class')
const scheduleTimes = require('../models/schedule/scheduleTimes')

router.post('/create-class', (req, res, next) => {
    auth(req, res, next, 'admin')
}, async (req, res) => {
    try {
        const _class = new Class({
            name: req.body.name,
            year: req.body.year,
            halfYear: req.body.halfYear,
            school: req.admin.schoolID,
        })
        
        await _class.save()

        return res.send(_class._id)
    } catch(err) {
        return res.send(err)
    }
})

router.post('/assign-class-teacher', (req, res, next) => {
  auth(req, res, next, 'admin')
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
  auth(req, res, next, 'admin')
}, async (req, res) => {
  const schoolData = req.body.data.school
  
  const school = new School({
      ...schoolData,
      owner: req.admin._id
  })
  
  try {
      const savedSchool = await school.save()
      req.admin.schoolID = savedSchool._id
      await req.admin.save()

      // // Create Scheduler Account 
      let generateSchedulerUsername = await Admin.generateSchedulerUsername(schoolData.schoolName, schoolData.city)

      const scheduler = new Scheduler({
          password: req.body.data.schedulerPassword, //generate
          username: generateSchedulerUsername,
          school: savedSchool._id
      })
      let savedScheduler = await scheduler.save()
     
      const schedule_times = new scheduleTimes({ schoolID: savedSchool._id })
      const savedTimes = await schedule_times.save()

      res.send({savedScheduler})
  } catch(err) {
      res.status(400).send(err)
  }
})

router.post('/create-student-accounts', (req, res, next) => {
  auth(req, res, next, 'admin')
}, async (req, res) => {
  const classID = req.body.classID
  const students = req.body.students

  try {
      const schoolID = req.admin.schoolID

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
        await Admin.generateUsername(student.name).then(async (generatedUsername) => {
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
  auth(req, res, next, 'admin')
}, async (req, res) => {
  try {
      const subject = await new Subject({
          name: req.body.name,
          teacher: req.body.teacherID,
          school: req.admin.schoolID,
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
  auth(req, res, next, 'admin')
}, async (req, res) => {
  let teachers = req.body.teachers

  if (teachers  === []) {
      throw new Error()
  }
  try {
      const schoolID = req.admin.schoolID // for security manual find in dB
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
          await Admin.generateUsername(teacher.name).then(async (generatedUsername) => {
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
  auth(req, res, next, 'admin')
}, async(req, res) => {
  try {
    const fetchedTeachers = await Teacher.find(
      { school: req.admin.schoolID }, '_id name username'
    )

    return res.send(fetchedTeachers)
  } catch(err) {
    log(err)
    return res.send(err)
  }
})

router.post('/fetch-admin-data', (req, res, next) => {
  auth(req, res, next, 'admin')
}, async(req, res) => {
  res.send(req.admin)
})

router.post('/delete-subject', (req, res, next) => {
  auth(req, res, next, 'admin')   
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
  auth(req, res, next, 'admin')
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
  auth(req, res, next, 'admin')
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

module.exports = router