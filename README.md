# 🎨 BrushSync

**BrushSync** is a real-time multiplayer collaborative drawing platform where multiple users can join the same canvas and draw together in real time.

It combines **real-time WebSocket communication, peer-to-peer connections, authentication, and a collaborative canvas** to create an interactive online whiteboard experience.

🔗 **Live Demo:** https://multiplayer-brush-sync.vercel.app/

---

## ✨ Features

- 🎨 **Real-time Collaborative Canvas**
  - Multiple users can draw on the same canvas simultaneously.
  - Drawing updates are synchronized in real time.

- ⚡ **Real-time Communication**
  - Socket.IO handles real-time synchronization between connected users.
  - PeerJS enables peer-to-peer communication.

- 👥 **Multiplayer Rooms**
  - Users can join collaborative drawing sessions.
  - Changes made by one user are reflected for other connected users.

- 🔐 **Authentication**
  - User authentication powered by Better Auth.
  - Secure user session management.

- 🎥 **Peer-to-Peer Communication**
  - PeerJS is used for direct peer-to-peer connections.
  - PeerServer is integrated into the backend.

- 🧑‍🎨 **Interactive Drawing**
  - Smooth canvas-based drawing experience.
  - Designed for collaborative brainstorming and visualization.

- 📱 **Responsive Interface**
  - Works across different screen sizes.

- 🚀 **Deployed Application**
  - Frontend deployed using Vercel.
  - Backend and real-time services deployed using Render.

---

## 🛠️ Tech Stack

### Frontend

- React.js
- JavaScript
- HTML5 Canvas
- CSS
- MediaPipe

### Backend

- Node.js
- Express.js
- Socket.IO
- PeerJS
- PeerServer

### Authentication & Database

- Better Auth
- PostgreSQL
- Neon

### Deployment

- Vercel
- Render

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │       Browser        │
                    │      React App       │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    │                      │
                    ▼                      ▼
             ┌─────────────┐       ┌─────────────┐
             │  Socket.IO  │       │   PeerJS    │
             │ Real-time   │       │ P2P Layer   │
             │   Events    │       │             │
             └──────┬──────┘       └──────┬──────┘
                    │                     │
                    ▼                     ▼
             ┌─────────────┐       ┌─────────────┐
             │   Express   │       │ PeerServer  │
             │   Backend   │       │             │
             └──────┬──────┘       └─────────────┘
                    │
                    ▼
             ┌─────────────┐
             │ Better Auth │
             │     +       │
             │ PostgreSQL  │
             └─────────────┘
```

---

## 🔄 How It Works

1. A user opens BrushSync and authenticates.
2. The client establishes a connection with the backend.
3. A drawing session/room is created or joined.
4. Canvas actions are captured on the client.
5. Drawing events are transmitted through Socket.IO.
6. Connected clients receive the drawing updates.
7. PeerJS establishes peer-to-peer connections where required.
8. Authentication and user data are handled through Better Auth and PostgreSQL.

This allows multiple users to interact with the same drawing environment with minimal delay.

---

## 📂 Project Structure

```text
BrushSync/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── ...
│   ├── public/
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── socket/
│   │   └── ...
│   ├── package.json
│   └── ...
│
└── README.md
```

> Update the folder structure above if your actual repository uses different directory names.

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/htyagi5/multiplayer-brush-sync.git

cd multiplayer-brush-sync
```

### 2. Install dependencies

For the frontend:

```bash
cd client
npm install
```

For the backend:

```bash
cd ../server
npm install
```

### 3. Configure environment variables

Create `.env` files for the client and server according to the variables required by your deployment configuration.

Example:

```env
VITE_CLIENT_URL=http://localhost:5173
VITE_SERVER_URL=http://localhost:3000

VITE_PEER_HOST_URL=localhost
VITE_PEER_PORT=3001
VITE_CONNECTION_SECURE=false
```

Also configure your PostgreSQL database and Better Auth credentials.

### 4. Start the backend

```bash
npm run dev
```

### 5. Start the frontend

```bash
cd client
npm run dev
```

Open the local development URL shown by Vite.

---

## 🌐 Deployment

BrushSync is deployed using:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| Peer-to-Peer Server | PeerServer |

### Live Application

👉 https://multiplayer-brush-sync.vercel.app/

---

## 🧠 What I Learned

Building BrushSync helped me work with several concepts beyond a traditional CRUD application:

- Real-time communication using Socket.IO
- WebSocket-based event synchronization
- Peer-to-peer communication using WebRTC/PeerJS
- Authentication and session management
- PostgreSQL database integration
- Real-time state synchronization
- MediaPipe-based computer vision
- Deploying frontend and backend separately
- Managing production environment variables
- Handling CORS and cross-origin communication
- Building interactive browser-based applications

---

## 🚀 Future Improvements

Some possible improvements include:

- 🖌️ More advanced drawing tools
- ↩️ Undo/Redo synchronization
- 💾 Persistent canvas storage
- 👥 User presence indicators
- 💬 Integrated real-time chat
- 🖼️ Image upload and manipulation
- 🧩 More collaborative editing tools
- 🔗 Shareable room links
- 📱 Improved mobile drawing experience

---

## 👨‍💻 Author

**Harshit Tyagi**

Computer Science & Engineering  
AKGEC

- GitHub: https://github.com/htyagi5
- LinkedIn: https://www.linkedin.com/in/harshit-tyagi/

---

## ⭐ Support

If you find BrushSync interesting, consider giving the repository a ⭐.

Built with curiosity, code, and a lot of debugging. 🚀
