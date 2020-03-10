const mongoose = require('mongoose')

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    city: {
        type: String,
        trim: true,
        required: true
    },
    roomCategories: [],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Admin'
    }
})

schoolSchema.virtual('admin', {
    ref: 'Admin',
    localField: '_id',
    foreignField: 'schoolID'
})

schoolSchema.virtual('students', {
    ref: 'Student',
    localField: '_id',
    foreignField: 'school'
})

schoolSchema.virtual('subjects', {
    ref: 'Subject',
    localField: '_id',
    foreignField: 'school'
})

schoolSchema.virtual('scheduler', {
    ref: 'Scheduler',
    localField: '_id',
    foreignField: 'school'
})

schoolSchema.virtual('scheduleTimes', {
    ref: 'scheduleTimes',
    localField: '_id',
    foreignField: 'schoolID'
})

const School = mongoose.model('School', schoolSchema)

module.exports = School