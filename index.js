const express = require('express')
const app = express()
const socket = require('socket.io')
const cors = require('cors')
app.use(cors())
app.get('/', (req,res) =>{
    res.send("HELLO WORLD")
})

let server = app.listen(process.env.PORT, () => {
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
io.on('connection', (socket)=>{
    console.log('connection made', socket.id)
    userList.push(socket.id)
    io.emit('new-connection', userList)
    socket.on('disconnect', (socket)=>{
        console.log('dc')
        let index = userList.indexOf(socket.id)
        userList.splice(index, 1)
    })
    socket.on('on-draw', (data)=>{
        console.log(data)
        if(userList[0] === socket.id){
            socket.broadcast.emit("broadcast", data);
        }
    })
    socket.on('refresh-userList', (data)=>{
        console.log('data')
        userList = data
    })
})


