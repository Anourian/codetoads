// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
  var names = {};

  var claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      return true;
    }
  };


  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (user in names) {
      res.push(user);
    }

    return res;
  };

  var free = function (name) {
    if (names[name]) {
      delete names[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get
  };
}());

// export function for listening to the socket
var users = [];
var gameStatus = {};

module.exports = function (socket) {
  socket.name = socket.handshake.query.user;
  var room = socket.handshake.query.chatroom;
  socket.join(room);
  if (!gameStatus[room]){
    gameStatus[room] = {
      player:[],
      goal:5,
      started:false
    };
  }
  var found = false;
  for (var i = 0; i < gameStatus[room].player.length; i++) {
    if (gameStatus[room].player[i].name === socket.name){
      found = true;
    }
  }
  if (!found){
    gameStatus[room].player.push({
        name: socket.name,
        current: 0
      });
  } else {
    //send game data for reconnect
  }
  this.to(room).emit('update:game', gameStatus[room])
  console.log(gameStatus[room]);
  users.push(socket.name);


  console.log("joined room: " + room);
  // send the new user their name and a list of users
  this.to(room).emit('init', {
    name: socket.name,
    users: users
 //   users: people
  });

  // notify other clients that a new user has joined
  this.to(room).emit('user:join', {
    name: socket.name
  });

  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    console.log('send message in room: ' + room);
    this.to(room).emit('send:message', {
      user: socket.name,
      text: data.text
    });
  });


  socket.on('person:won', function (data, fn) {
    console.log(data.test + ' has won!');
  });


  socket.on('person:passed', function(data) {
    for (var i = 0; i < gameStatus[room].player.length; i++) {
      if (data.name === gameStatus[room].player[i].name) {
        gameStatus[room].player[i].current++;
        //emit to everyone and socket that sent it
        this.to(room).emit('update:game', gameStatus[room]);
        socket.emit('update:game', gameStatus[room]);
        if (gameStatus[room].player[i].current === gameStatus[room].goal) {
          this.to(room).emit('winner', {
            winner: data.name
          });
          socket.emit('winner', {
            winner: data.name
          })
        }
        return;
      }
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    this.to(room).emit('user:left', {
      name: socket.name
    });
    userNames.free(socket.name);
  });
};
