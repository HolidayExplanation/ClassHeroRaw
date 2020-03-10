const mongoose = require('mongoose')

const subjectSchema = new mongoose.Schema({
    teacherName: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Teacher'
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Class'
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'School'
    },
    created: {
        type: Date,
        required: false,
        default: new Date()
    }
})

const Subject = mongoose.model('Subject', subjectSchema)

module.exports = Subject