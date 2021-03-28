const express = require('express')
const cors = require('cors')
const app = express()
const { default: axios } = require("axios")
const router = require('./routes/pushNotifications')

require('dotenv').config()

axios.defaults.baseURL = process.env.API_URL

const PORT = process.env.PORT || 8000

const server = app.listen(PORT , () => {
    console.log(`Server started at PORT ${PORT}`)
})

global.connectedUsers = []
global.sockets = []
global.backgroundUsers = []



app.use(cors())


app.get('/' , (req , res) => {
    res.send("Welcome to real time engine")
})

app.get('/users/:id' , (req , res) => {

    const id = req.params.id
    console.log(id)
    const filteredUsers = connectedUsers.filter(user => user.id != id)
    res.json(filteredUsers)
 
    // console.log(filteredUsers);
})


require('./config/socketConfig')(server)


app.use(router)

app.use((req ,res) => {

    res.status(404).send('Not Found')
})

