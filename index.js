const express = require('express')
const app = express()
const socket = require('socket.io')
const randomWords = require('random-words');
const cors = require('cors')
app.use(cors())
app.get('/', (req, res) => {
    res.send("HELLO WORLD")
})
app.get('/get/word', (req, res) => {
    res.send(randomWords())
})
let server = app.listen(process.env.PORT || 8000, () => {
    console.log("App on")
})
let io = socket(server, {
    // Now, the CORS config.
    // You could either use the new `cors` property...
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["content-type"]
    },

})
let userList = []
let gameRunning = false
io.on('connection', (socket) => {
    console.log('connection made', socket.id)
    userList.push(socket.id)
    io.emit('new-connection', userList)
    socket.on('disconnect', () => {
        console.log('dc', socket.id)
        let index = userList.indexOf(socket.id)
        userList.splice(index, 1)
    })
    socket.on('on-draw', (data) => {
        if (userList[0] === socket.id) {
            socket.broadcast.emit("broadcast", data);
        }
    })
    socket.on('start-game', () => {
        if (!gameRunning) {
            gameRunning = true
            const timer = setInterval(() => {
                if (userList.length < 2) {
                    clearInterval(timer)
                    gameRunning = false
                }else{
                    const movedUser = userList.splice(0, 1)
                    userList = userList.concat(movedUser)
                    console.log('changed userList', userList)
                    io.emit('switch-player', userList)
                }

            }, 20000)

        }
    })
    socket.on('refresh-userList', (data) => {
        console.log('data from', data)
        userList = data
    })
})


