window.addEventListener('load', main);

const msgs = [];

const uh = document.getElementById("chatview");

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
          window.localStorage.setItem('user', username);
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
      uh.scrollTop = uh.scrollHeight;
    });

    socket.on('enter', function(user) {
      let name = window.localStorage.getItem('user');
      let send = "";
      let cnt = user.ppl.filter(n => n === name).length;
      if(name === null) {
        window.localStorage.setItem('user', user.usname);
        name = window.localStorage.getItem('user');
        send = "/name " + name;
        checkMsg(send);
      }
      if(cnt > 1) {
        window.localStorage.setItem('user', user.usname);
        name = window.localStorage.getItem('user');
        send = "/name " + name;
        checkMsg(send);
      }
      send = "/name " + name;
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
      });
    });

    socket.on('change_color', function(col) {
      $('.username' + col.idt).css({'color': '#'+col.colr, 'font-weight':'Bold'});
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
