window.addEventListener('load', main);

// const COLORS = ['#7b2ee0', '#e21440', '#f8a700',
//     '#206107', '#0076bf', '#d8247c', '#93c7c3',
//     '#e86325', '#6f7179', '#5d4122'];

const msgs = [];

const uh = document.getElementById("chatview");

// function getcolor(number) {
//     // const rand = Math.floor(Math.random()*COLORS.length);
//     let rand = number-1;
//     return COLORS[rand];
// }

function prep() {
  if (window.matchMedia("(max-width: 960px)").matches) {
    document.getElementById("chat").style.width="100%";
  }
  if (window.matchMedia("(min-width: 960px)").matches) {
    document.getElementById("chat").style.width="960px";
  }
}


function chatload() {
  let username;
  let color;
  
  $(function () {
    var socket = io();

    $('form').submit(function(e) {
      e.preventDefault(); // prevents page reloading
      var str = $('#m').val();
      checkMsg(str);
         // socket.emit('chat_message', str);
      $('#m').val('');
      return false;
    });

    const checkMsg = (string) => {
      if(string.substring(0, 1) === "/") {
        changeCheck(string);
      }
      else {
        socket.emit('chat_message', string);
      }
    }

    const changeCheck = (string) => {
      if(string.indexOf("name") > 0) {
        if(string.substring(1, 5) === "name") {
          changeName(string);
        }
      }
      else if (string.indexOf("color") > 0) {
        if(string.substring(1, 6) === "color") {
          changeColor(string);
        }
      } 
      else {
        console.log("idk what you're trying to say");
      }
    }

    const changeName = (string) => {
      if(string.substring(5, 6) === " ") {
          username = string.substring(6).trim();
          if(username === '') return;
          // console.log(username);
          window.localStorage.setItem('user', username);
          // console.log('changed ' + username);
          socket.emit('change_user', username);
        }
        else { 
          console.log("Put space after '/name' please");
          string = '';
        }
    }

    const changeColor = (string) => {
      let code = string.substring(6).trim();
      if(string.substring(6, 7) === " ") {
          if(code.length !== 6) {
            console.log("no");
          }
          else {
            color = string.substring(7).trim();
            if(/^[0-9A-F]{6}$/i.test(color)) {
              socket.emit('change_color', color);
              // console.log(color);
            }
          }
        }
        else { 
          console.log("Put space after '/color' please");
          string = '';
        }
    }

    const textEmoji = (string) => {
      let b = string.replaceAll(":)", "&#128513;");
      b = b.replaceAll(":D", "&#128515;");
      b = b.replaceAll(/:o/gi, "&#128558");
      b = b.replaceAll(":(", "&#128577;");
      b = b.replaceAll("T.T", "&#128557;");
      b = b.replaceAll(/:p/gi, "&#128539;");
      b = b.replaceAll("<3", "&#128151;");
      b = b.replaceAll(/:uwu:/gi, "&#129402;");
      b = b.replaceAll(";)", "&#128521;");
      // console.log(b);
      return(b);
    }

    socket.on('load_chat', function(hist){
      hist.forEach ( (msg) => {
        var $uname = $('<span class="username"/>')
          .attr('class', "username"+msg.idt)
          .html(msg.username + " ")
          .css({'color': '#'+msg.colr, 'font-weight':'Bold'});     
        var $mssg = $('<span class="mssgb"/>')
          .html(textEmoji(msg.message));
        var $unmsg = $('<li class="content"/>')
          .append($uname, $mssg);
        $('#messages').append($unmsg);
        // console.log($unmsg.text());
        }
      );
    });

    socket.on('chat_message', function(msg){
      var $uname = $('<span class="username"/>')
        .attr('class', "username"+msg.idt)
        .html(msg.username + " ")
        .css({'color': '#'+msg.colr, 'font-weight':'Bold'});     
      var $mssg = $('<span class="mssgb"/>')
        .html(textEmoji(msg.message));
      var $unmsg = $('<li class="content"/>')
        .append($uname, $mssg);
      $('#messages').append($unmsg);
      // saveMsgs($unsmg);
      uh.scrollTop = uh.scrollHeight;
    });
        
    socket.on('self_message', function(msg){
      var $uname = $('<span class="username"/>')
        .attr('class', "username"+msg.idt)
        .html(msg.username + " ")
        .css({'color': '#'+msg.colr, 'font-weight':'Bold'});     
      var $mssg = $('<span class="mssgb"/>')
        .html(textEmoji(msg.message));
      var $unmsg = $('<li class="content"/>')
        .append($uname, $mssg)
        .css('background', '#deeef3');
      $('#messages').append($unmsg);
      // saveMsgs($unmsg);
      uh.scrollTop = uh.scrollHeight;
    });

    // socket.on('enter', function(user) {
    //   let name = window.localStorage.getItem('user');
    //   if(name === null) {
    //     window.localStorage.setItem('user', user.uname);
    //     name = window.localStorage.getItem('user');
    //     setName(name);
    //   }
    //   if(user.ppl.indexOf(name) !== -1) {
    //     // let uname = user.uname;
    //     window.localStorage.setItem('user', user.uname);
    //     name = window.localStorage.getItem('user');
    //     setName(name);
    //   }
    //   const ind = user.ppl.indexOf(user.usname);
    //   user.usname = name;
    //   user.ppl.splice(ind, 1, user.usname);

    //   $('#usernames').empty();
    //   user.ppl.forEach((username) => {
    //     $('#usernames').append($('<li>').text(username));
    //   });
    //   console.log(name);

    // });

    // const setName = (nem) => {
    //   socket.emit('enter', nem);
    //   console.log('woop');
    //   console.log(nem);
    // }


    socket.on('enter', function(user) {
      let name = window.localStorage.getItem('user');
      let send = "";
      let cnt = user.ppl.filter(n => n === name).length;
      // console.log(cnt);
      // console.log(name + ":p");
      if(name === null) {
        window.localStorage.setItem('user', user.usname);
        name = window.localStorage.getItem('user');
        send = "/name " + name;
        // console.log("oh");
        checkMsg(send);
      }
      if(cnt > 1) {
        window.localStorage.setItem('user', user.usname);
        name = window.localStorage.getItem('user');
        send = "/name " + name;
        checkMsg(send);
      }
      send = "/name " + name;
      // console.log(send);
      checkMsg(send);
    });

    socket.on('add_user', function(user) {
      $('#usernames').empty();
      user.ppl.forEach((username) => {
        $('#usernames').append($('<li>').text(username));
      });
    });
        
    socket.on('you_user', function(user) {
      $('#m').attr('placeholder', user.usname + "'s Message...");
    });

    socket.on('uchange_user', function(user) {
      $('#m').attr('placeholder', user.usname + "'s Message...");
    });

    socket.on('change_user', function(user) {
      $('#usernames').empty();
      user.ppl.forEach((username) => {
        $('#usernames').append($('<li>').text(username));
        // console.log(username);
      });
    });

    socket.on('change_color', function(col) {
      $('.username' + col.idt).css({'color': '#'+col.colr, 'font-weight':'Bold'});
      // console.log(col.colr);
    });

    socket.on('rem_user', function(user) {
      $('#usernames').empty();
      user.ppl.forEach((username) => {
        $('#usernames').append($('<li>').text(username));
      });
    });

  });
}

function main() {
    prep();
    chatload();
}
