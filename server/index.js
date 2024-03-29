require('dotenv').config()
require('./db/mongoose')
const express = require('express')
const cors = require('cors')

// Global
const register = require('./routers/global/register')
const login = require('./routers/global/login')
const recover_account = require('./routers/global/recover_account')
const logout = require('./routers/global/logout')
const logout_all = require('./routers/global/logout_all')

const planer = require('./routers/planer')
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
app.use(recover_account)
app.use(logout)
app.use(logout_all)

app.use(planer)
app.use(teacher)


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})