const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const schedulerSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        minlength: 7,
        trim: true,
        required: true
    },
    accountType: {
        type: String,
        default: 'scheduler'
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'School'
    },
    tokens: [{
        token: {
            type: String,
            required: false
        }
    }]
})

schedulerSchema.methods.toJSON = function() {
    const scheduler = this
    const schedulerObject = scheduler.toObject()

    delete schedulerObject.password
    delete schedulerObject.tokens

    return schedulerObject
}

schedulerSchema.methods.generateAuthToken = async function() {
    const scheduler = this
    const token = jwt.sign({ _id: scheduler._id.toString()}, process.env.SECRET_CODE) // make config file and import secretcode from there
    scheduler.tokens = scheduler.tokens.concat({ token })
    
    await scheduler.save()
    return token
}

schedulerSchema.pre('save', async function(next) {
    const scheduler = this

    if (scheduler.isModified('password')) {
        scheduler.password = await bcrypt.hash(scheduler.password, 8)
    }

    next()
})

// add config secret_key

const Scheduler = mongoose.model('Scheduler', schedulerSchema)


module.exports = Scheduler