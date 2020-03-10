const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Teacher = require('../users/teacher')
const Student = require('../users/student')
const Scheduler = require('../users/scheduler')
const log = console.log

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: false,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.')
            }
        } 
    },
    password: {
        type: String,
        minlength: 7,
        trim: true,
        required: true,
        validate(value) {
            if (value.includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    recoveryKey: {
        type: String,
        trim: true,
        required: true
    },
    accountType: {
        type: String,
        default: 'admin'
    },
    schoolID: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'School'
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

adminSchema.virtual('schools', {
    ref: 'School',
    localField: '_id',
    foreignField: 'owner'
})

adminSchema.methods.toJSON = function() {
    const admin = this
    const adminObject = admin.toObject()

    delete adminObject.password
    delete adminObject.tokens

    return adminObject
}

adminSchema.methods.generateAuthToken = async function() {
    const admin = this
    const token = jwt.sign({ _id: admin._id.toString()}, process.env.SECRET_CODE)
    admin.tokens = admin.tokens.concat({ token })

    await admin.save()
    return token
}

// define findByCredentials func
adminSchema.statics.findByCredentials = async (username, password) => {
    const admin = await Admin.findOne({ username })
    let teacher
    let student
    let scheduler

    if (!admin) {
        teacher = await Teacher.findOne({ username })
        if (!teacher) {
            student = await Student.findOne({ username })
            if (!student) {
                scheduler = await Scheduler.findOne({ username })
            }
        }
    }

    if (!admin && !teacher && !student && !scheduler) {
        throw new Error('Unable to login.')
    }

    let isMatch

    if (admin) {
        isMatch = await bcrypt.compare(password, admin.password)
    } else if (teacher) {
        isMatch = await bcrypt.compare(password, teacher.password)
    } else if (student) {
        isMatch = await bcrypt.compare(password, student.password)
    } else if (scheduler) {
        isMatch = await bcrypt.compare(password, scheduler.password)
    }

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    if (admin) {return admin}
    else if (teacher) {return teacher}
    else if (student) {return student}
    else if (scheduler) {return scheduler}
}

adminSchema.statics.findByRecoveryKey = async (username, recoveryKey) => {

    const admin = await Admin.findOne({ username })
    const isMatch = await bcrypt.compare(recoveryKey, admin.recoveryKey)

    log(isMatch)

    if (!isMatch) throw new Error()
    else return admin
}

adminSchema.statics.generateAdminUsername = async(accountType, schoolName, city) => {
    schoolName = schoolName.toLowerCase()
    city = city.toLowerCase()

    let usernameArray
    let generatedSchoolName = ""
    let wordIndex = 0
    if (
    schoolName.includes('-') ||
    schoolName.includes(' - ') ||
    schoolName.includes(' ')
    ) {
        usernameArray = schoolName.split(/[\s-]+/)
        usernameArray.forEach(word => {
            wordIndex = 0
            if (word.charAt(0) === "(" || word.charAt(0) === "-" || word.charAt(0) === ".") {
                wordIndex = 1
            } else {
                word = word.charAt(0)
            }

            generatedSchoolName = generatedSchoolName + word.charAt(wordIndex)
        })
    }

    let generatedCityName
    const startChar = city.charAt(0)
    const middleChar = city.charAt(Math.floor((city.length - 1) / 2))
    const endChar = city.charAt(city.length - 1)
    generatedCityName = startChar + middleChar + endChar

    let randNum
    let generatedUsername
    let count
    const genUsernameAndCountDocs = async() => {
        randNum =  Math.floor(Math.random() * Math.floor(999))

        generatedUsername = `${generatedSchoolName}.${generatedCityName}.${accountType}.${randNum}`.toLowerCase()

        if (accountType === 'admin') {
            count = await Admin.countDocuments({ // Check if username exists
                username: { $regex: new RegExp(generatedUsername) }
            })
        } else if (accountType === 'planer') {
            count = await Scheduler.countDocuments({ // Check if username exists
                username: { $regex: new RegExp(generatedUsername) }
            })
        }
    }
    
    genUsernameAndCountDocs()

    if (count >= 1) { // while username taken, generate new
        genUsernameAndCountDocs()
    } else {
        return generatedUsername
    }
}

adminSchema.statics.generateSchedulerUsername = async(schoolName, city) => {
    schoolName = schoolName.toLowerCase()
    city = city.toLowerCase()

    let randNum
    let generatedUsername
    let count
    const genUsernameAndCountDocs = async() => {
        randNum =  Math.floor(Math.random() * Math.floor(999))

        generatedUsername = `${schoolName}.${city}.planer.${randNum}`.toLowerCase()

        count = await Scheduler.countDocuments({ // Check if username exists
            username: { $regex: new RegExp(generatedUsername) }
        })
    }

    genUsernameAndCountDocs()

    if (count >= 1) { // while username taken, generate new
        genUsernameAndCountDocs()
    } else {
        return generatedUsername
    }
}

adminSchema.statics.generateUsername = async(name) => {
    name = name.split(' ')

    name = name.toString()

    var newchar = '.'
    name = name.split(',').join(newchar);

    let generatedUsername = `${name}`.toLowerCase()
    let countTracker = 0

    const Count = ((count) => {
        if (count >= 1) {
            count++
            countTracker += count
        }
    })

    await Promise.all([Teacher, Student].map(async (model) => {
        const count = await model.countDocuments({
            username: { $regex: new RegExp(generatedUsername) }
        })

        Count(count)
    }))  
    
    if (countTracker === 0) {
        generatedUsername = `${name}`.toLowerCase()
    } else {
        generatedUsername = `${name}.${countTracker}`.toLowerCase()
    }
    
    console.log("final", countTracker)
    return generatedUsername
}


adminSchema.pre('save', async function(next) {
    const admin = this

    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8)
    }

    if (admin.isModified('recoveryKey')) {
        admin.recoveryKey = await bcrypt.hash(admin.recoveryKey, 8)
    }
    
    next()
})

const Admin = mongoose.model('Admin', adminSchema)


module.exports = Admin