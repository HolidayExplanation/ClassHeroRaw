const mongoose = require('mongoose')

const vertretungSchema = new mongoose.Schema({
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
        type: String,
        required: true,
    },
    schoolID: {
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

const Vertretung = mongoose.model('Subject', vertretungSchema)

module.exports = Vertretung