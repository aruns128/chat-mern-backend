const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = require('http').createServer(app); // Use 'http' to create the server

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

// Replace global variables with an object to store user data
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('socket connected');

  socket.on('add-user', (userId) => {
    console.log('add-user called ', userId);
    // Store the socket ID associated with the user ID
    onlineUsers.set(userId, socket.id);
  });

  socket.on('send-msg', (data) => {
    console.log('send-msg called ', data);
    const sendUserSocket = onlineUsers.get(data.to);

    console.log('onlineUsers:', onlineUsers);

    if (sendUserSocket === undefined) {
      console.log(`User with ID ${data.to} is not online.`);
    } else {
      // Send the message to the specified user
      console.log(data.messages)
      io.to(sendUserSocket).emit('msg-receive', data.messages);
    }
  });


  socket.on('disconnect', () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
      }
    });
  });
});

const PORT = process.env.PORT || 5000; // Use '||' instead of '|'

app.use(cors());
app.use(express.json());

app.use('/api/auth', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/logout/:id', async (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
})

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('db connected successfully');
  })
  .catch((err) => {
    console.error(err.message);
  });

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
