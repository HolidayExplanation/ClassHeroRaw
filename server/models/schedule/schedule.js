const mongoose = require('mongoose')

const staticScheduleSchema = new mongoose.Schema({
  classID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Class'
  },
  days: {
    type: Array,
    default: []
  }
})

staticScheduleSchema.virtual('Classes', {
  ref: 'Class',
  localField: 'classID',
  foreignField: '_id'
})

const staticSchedule = mongoose.model('staticSchedule', staticScheduleSchema)

module.exports = staticSchedule