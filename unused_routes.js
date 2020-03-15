// Add DELETE (Archive)
router.patch('/update-teacher', (req, res, next) => {
  auth(req, res, next, 'planer')
}, async (req, res) => {
  const teacher = req.body.teacher
  try {
      const fetchedTeacher = await Teacher.findById(teacher._id)

      const firstNameChanged = teacher.firstName !== fetchedTeacher.firstName,
            lastNameChanged = teacher.lastName !== fetchedTeacher.lastName

      if (firstNameChanged || lastNameChanged) {
          let newUsername = await Planer.generateUsername(teacher.firstName, teacher.lastName)
          await Teacher.updateOne({ username: teacher.username}, 
          {
              firstName: teacher.firstName,
              lastName: teacher.lastName,
              username: newUsername,
              email: teacher.email,
              phoneNumber: teacher.phoneNumber
          })

          return res.send({ status: 200, newUsername })
      } else {
          await Teacher.updateOne({ username: teacher.username}, 
          {
              firstName: teacher.firstName,
              lastName: teacher.lastName,
              email: teacher.email,
              phoneNumber: teacher.phoneNumber,
              teacherFirstName: teacher.firstName,
              teacherLastName: teacher.lastName
          })

          return res.send({ status: 200 })
      }
  } catch(err) {
      return res.send({ status: 404 })
  }
})

router.post('/fetch-classes-and-teachers', (req, res, next) => {
  log("body: " + req.body.authToken)
  auth(req, res, next, 'planer', req.body.authToken)
}, async(req, res) => {
  const school = req.body.schoolID
  try {
      let classes = await Class.find({ school }, '_id name classTeacher created classTeacher fn ln halfYear')
      const teachers = await Teacher.find({ school }, '_id username assignedClassID')

      let classesForLocal = []
      classesForLocal = classes

      

      classes = classesForLocal
    
      teachers.map(teacher => { // remove teachers that have a class
          return !teacher.assignedClassID
      })
              
      // let sorted = [] // Create ARR of only IDs
      // for (i = 0; i < classes.length; ++i) {
      //     sorted.push(classes[i]._id)
      // }

      res.send({classes, teachers})
  } catch(err) {
      log(err)
  }
})

router.post('/cm-fetch-subjects', (req, res, next) => {
  auth(req, res, next, 'planer', req.body.authToken)
}, async (req, res) => {
  try {
      const subjects = await Subject.find({ school: req.body.schoolID }, `teacherName teacherLastName _id name`)

      return res.send({ subjects })
  } catch(err) {
      log(err)
      return res.send(err)
  }
})