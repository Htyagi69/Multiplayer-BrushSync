import { Server } from "socket.io";
import {createServer} from 'http'
import express from "express";
import {v4 as uuidv4} from 'uuid'
import cors from'cors'
import {PeerServer} from 'peer'

const app=express();
const httpserver=createServer(app)

app.use(express.json());
app.use(cors({
    origin:["http://localhost:5173"],
}))

const peerServer=new PeerServer({
    port:3001,
    path:'/peerjs',
    allow_discovery:true
})
console.log(`Peerjs is running at port 3001`);

const io=new  Server(httpserver,{
    cors:{
        origin:"*",
    }
})


app.get('/room',(req,res)=>{
    return res.json({roomId:`${uuidv4()}`})
})

io.on('connection',socket=>{
    socket.on('join-room',(roomId,userId)=>{
        console.log(roomId,userId);
        socket.join(roomId);
        socket.to(roomId).emit('user-connected',userId)
        socket.on('disconnect',()=>{
            socket.to(roomId).emit('user-disconnected',userId)
        })
    })
})
httpserver.listen(3000,()=>{
    console.log(`Server is listening at http://localhost:3000`);
     
})