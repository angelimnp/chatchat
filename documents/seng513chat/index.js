const express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static("main"));

var people = [];
var hist = [];

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.username = "hi";
  socket.num = "10";
  socket.color = '7b2ee0';
  Object.keys(io.sockets.sockets).forEach( (id) => {
    socket.username = id.slice(0,12);
    socket.num = id.slice(0,6);
  });

  people.push(socket.username);
  var getPer = people.find(n => (n === socket.username));
  if(getPer) {
    socket.emit('load_chat', hist);
  }

  socket.on('chat_message', (msg) => {
    let time = new Date();
    let minutes = ((time.getMinutes()<10?'0':'') + time.getMinutes());
    msg = time.getHours() + ":" + minutes + 
    " " + msg;

    if(hist.length >= 200) {
      hist.shift();
    }
    let h = { username: socket.username,
      idt: socket.num,
      message: msg,
      colr: socket.color
    };
    hist.push(h);

    socket.broadcast.emit('chat_message', {
      username: socket.username,
      idt: socket.num,
      message: msg,
      colr: socket.color
    });
    socket.emit('self_message', {
      username: socket.username,
      idt: socket.num,
      message: msg,
      colr: socket.color
    });
  });

  io.emit('enter', {
    ppl: people,
    usname: socket.username,
    idt: socket.num
  });
  io.emit('add_user', {
    ppl: people,
    usname: socket.username,
    idt: socket.num
  });
  socket.emit('you_user', {
    usname: socket.username,
    idt: socket.num
  });

  socket.on('change_user', (username) => {
    if(people.indexOf(username) !== -1) return;
    const ind = people.indexOf(socket.username);
    socket.username = username;
    people.splice(ind, 1, socket.username);
    console.log(people);

    io.emit('change_user', {
      ppl: people,
      usname: socket.username
    });
    socket.emit('uchange_user', {
      usname: socket.username
    });
  });

  socket.on('change_color', (col) => {
    socket.color = col;
    io.emit('change_color', {
      usname: socket.username,
      idt: socket.num,
      colr: socket.color
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    people.splice(people.indexOf(socket.username), 1);
    io.emit('rem_user', {
      ppl: people,
      usname: socket.username,
      idt: socket.num,
    });
  });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
