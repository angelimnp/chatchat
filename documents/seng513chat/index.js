const express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static("main"));

// var usersNum = 0;
var people = [];
// var col = 0;
var hist = [];
// var count = 1;

io.on('connection', (socket) => {
  console.log('a user connected');
  
  // ++usersNum;
  // ++col;
  // socket.username = "User" + count;
  // count++;
  socket.username = "hi";
  socket.num = "10";
  socket.color = '7b2ee0';
  Object.keys(io.sockets.sockets).forEach( (id) => {
    socket.username = id.slice(0,12);
    socket.num = id.slice(0,6);
    // console.log("ID: ", id);
  });

  // let un = socket.username;
  people.push(socket.username);
  var getPer = people.find(n => (n === socket.username));
  if(getPer) {
    socket.emit('load_chat', hist);
  }

  // var color = col;
  // console.log(color);
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
    // console.log(hist);

    // console.log('message: ' + msg);

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

  // var users = io.sockets.sockets; 
  // console.log(Object.keys(users));
  
  // socket.on('enter', (name) => {
  //   const ind = people.indexOf(socket.username);
  //   socket.username = name;
  //   people.splice(ind, 1, socket.username);
  //   socket.username = name;
  //   console.log(socket.username);


  // });

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
    
  // console.log(people);

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
    // console.log(socket.color);
    io.emit('change_color', {
      usname: socket.username,
      idt: socket.num,
      colr: socket.color
    });
  });

  socket.on('disconnect', () => {
    // --usersNum;
    // --col;
    console.log('user disconnected');
    people.splice(people.indexOf(socket.username), 1);
    console.log(people);
    io.emit('rem_user', {
      ppl: people,
      usname: socket.username,
      idt: socket.num,
    });
    // Object.keys(io.sockets.sockets).forEach( (id) => {
    //   console.log("ID: ", id);
    // });
  });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});