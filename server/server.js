import { Server } from "socket.io";
import {createServer} from 'http'
import express from "express";
import {v4 as uuidv4} from 'uuid'
import cors from'cors'
import {ExpressPeerServer} from 'peer'

const app=express();
const httpserver=createServer(app)

app.use(express.json());
app.use(cors({
    origin:["https://multiplayer-brush-sync.vercel.app",
        "https://multiplayer-brush-sync-git-main-harshiis-projects.vercel.app",
        "https://multiplayer-brush-sync-5a2cksu4c-harshiis-projects.vercel.app",
        "http://localhost:5173",
    ],
}))

// --- COMBINE PEERJS WITH EXPRESS ---
const peerServer = ExpressPeerServer(httpserver, {
    debug: true,
    path: '/' 
});
console.log(`Peerjs is running at port 3001`);
// This is the "door" the frontend knocks on
app.use('/peerjs', peerServer);

const io = new Server(httpserver, {
    cors: {
        // Replace "*" with your actual Vercel URL
        origin: "https://multiplayer-brush-sync.vercel.app", 
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['polling', 'websocket']
});

app.get('/',(req,res)=>{
    return res.json({message:"Hello from Server"})
})
app.get('/room',(req,res)=>{
    return res.json({roomId:`${uuidv4()}`})
})

io.on('connection', socket => {
    // We use a variable to store the roomId for this specific socket
    let currentRoomId = null;

    socket.on('join-room', (roomId, userId, name) => {
        currentRoomId = roomId; // Save it here
        socket.join(roomId);
        console.log(`User ${name} joined ${roomId}`);
        
        // Notify others
        socket.to(roomId).emit('user-connected', userId);
    });

    // Move these OUTSIDE join-room but INSIDE connection
    socket.on('mouse-move', (data) => {
        if (currentRoomId) {
            socket.to(currentRoomId).emit('user-mouse-moved', {
                userId: socket.id, 
                x: data.x, 
                y: data.y,
                name: data.name,
            });
        }
    });

    socket.on('drawing-change', (data) => {
        if (currentRoomId) {
            socket.to(currentRoomId).emit('drawing-change', data);
        }
    });

    socket.on('disconnect', () => {
        if (currentRoomId) {
            // userId needs to be tracked or passed here
            socket.to(currentRoomId).emit('user-disconnected', socket.id);
        }
    });
});
const PORT = process.env.PORT || 3000;
httpserver.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
