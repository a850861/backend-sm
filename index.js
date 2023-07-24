const express=require('express');
const port=3000;
const port1=3001
const app=express();
const bodyParser = require('body-parser');
require('./db')
require('./models/User')
require('./models/Message')
const authRoutes= require('./routes/authRoutes');
const uploadMediaRoutes=require('./routes/uploadMediaRoutes')
const messageRoutes=require('./routes/messageRoutes')
//
const {createServer}=require('http')
const {Server}=require('socket.io');
const { SourceTextModule } = require('vm');
const httpServer=createServer()
const io=new Server(httpServer,{})
//

app.use(bodyParser.json());
app.use(authRoutes);
app.use(uploadMediaRoutes)
app.use(messageRoutes)

app.get('/',(req,res)=>{
    res.send("Helloe World");
})

io.on('connection',(socket)=>{
    console.log("USER CONNECTED - ",socket.id)
    socket.on('disconnect',()=>{
    console.log("USER DISCONNECTED - ",socket.id)

    })
    socket.on("join_room",(data)=>{
        console.log("USER WITH ID - ",socket.id,"JOIN ROOM -",data.roomid)
        socket.join(data)
    })
    socket.on("send_message",(data)=>{
        console.log("MESSAGE RECEIVED - ",data)
        io.emit("receive_message",data)
    })
   
})
httpServer.listen(port1,()=>{
    console.log("Socketio server is running on port" + port1)

})

app.listen(port,()=>{
    console.log("server is running on port" + port)
})