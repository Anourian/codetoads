// export function for listening to the socket
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

  console.log("joined room: " + room);
  // send the new user their name and a list of users
  this.to(room).emit('init', {
    name: socket.name,
    users: gameStatus[room].player
  });
  socket.to(room).emit('init', {
    name: socket.name,
    users: gameStatus[room].player
  });

  // notify other clients that a new user has joined
  this.to(room).emit('user:join', {
    name: gameStatus[room].player[gameStatus[room].player.length - 1].name,
    users: gameStatus[room].player
  });

  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    this.to(room).emit('send:message',
    {
      user: data.message.user,
      text: data.message.text
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
  });
};
