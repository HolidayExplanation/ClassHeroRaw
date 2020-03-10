require('dotenv').config();
const express = require('express')
const cors = require('cors')
require('./db/mongoose')

// Global
const register = require('./routers/global/register')
const login = require('./routers/global/login')
const recoverAccount = require('./routers/global/recoverAccount')
const logout = require('./routers/global/logout')
const logout_all = require('./routers/global/logout_all')

const admin = require('./routers/admin')
const scheduler = require('./routers/scheduler')
const teacher = require('./routers/teacher')

const app = express()
const port = process.env.PORT || 3000

//enables cors
app.use(cors({
    'allowedHeaders': ['Authorization', 'Content-Type'],
    'exposedHeaders': ['Authorization'],
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}))

app.use(express.json())

// Global for Forms
app.use(register)
app.use(login)
app.use(recoverAccount)
app.use(logout)
app.use(logout_all)

app.use(admin)
app.use(scheduler)
app.use(teacher)


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})