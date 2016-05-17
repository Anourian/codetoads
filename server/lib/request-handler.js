var db = require('./../db/config');
var request = require('request');
var User = require('./../db/db').User;
var Game = require('./../db/db').Game;
var Easy = require('./prompts').Easy;
var Medium = require('./prompts').Medium;
var Hard = require('./prompts').Hard;
var Insane = require('./prompts').Insane;
var Debug = require('./prompts').Debug;
var Typing = require('./prompts').Typing;
var MultiQuestions = require('./prompts').MultiQuestions;

module.exports.saveUser = function(req, res) {
    var newUser = {
       user_id: req.body.user_id,
       username: req.body.nickname,
       firstname: req.body.given_name,
       lastname: req.body.family_name,
       email: req.body.email,
       picture: req.body.picture
    }

    User.filter({user_id: req.body.user_id}).run()
      .then(function (users) {
        var user = users[0];
        if(user) {
          return new Error('User already exists');
        } else {
          User.save(newUser)
            .then(function (user) {
              return user;
            })
            .catch(function (err) {
              return null;
            });
        }
      });
}

var grabPrompt = function(level, iterator) {
  //randomly pick challenge based on choice posted
  var prompt;
  if (level === 'easy') {
    prompt = Easy[Math.floor(Math.random() * Easy.length)];
  } else if (level === 'medium') {
    prompt = Medium[Math.floor(Math.random() * Medium.length)];
  } else if (level === 'hard') {
    prompt = Hard[Math.floor(Math.random() * Hard.length)];
  } else if (level === 'debug') {
    prompt = Debug[Math.floor(Math.random() * Debug.length)]
  } else if (level === 'insane') {
    prompt = Insane[Math.floor(Math.random() * Insane.length)];
  }
  //generate query
  var options = {
    headers: {
      Authorization: process.env.cwKey
    },
    url : 'https://www.codewars.com/api/v1/code-challenges/' +
    prompt + '/javascript/train'
  };
  //grab prompt and send back
  request.post(options, function(err, response, body) {
    if(err){
      iterator(err, null, null);
    } else if (body.indexOf('!DOCTYPE')<0){
      var info = JSON.parse(body);
      //async data
      iterator(null, null, info)
    } else {
      iterator(null, 500, null)
    }
  });
};

//Used to shuffle promptS
var shuffle = function(array) {
  var arr = Array.prototype.slice(array);

  array.forEach(function(value, index){
    //generates random whole number with range 0 to array length
    var random = Math.max(0,(Math.floor(Math.random() * arr.length)));
    //swaps current index/value with random index/value
    arr[index] = arr[random];
    arr[random] = value;
  });

  return arr;
};

module.exports.makeGame = function(req, res) {
  var result = [];
  var questArray = [];

  for (var i = 0; i < MultiQuestions.length; i++ ) {
    questArray.push(i);
  }
  questArray = shuffle(questArray);

  for (var i = 0; i < req.body.numPrompt - 3; i++) {
    var level;
    if(i === 0){
      level = req.body.difficulty;
    } else {
      level = 'debug'
    }
    //make the calls to generate prompts
    grabPrompt(level, function(err, status, info) {
      if (err) {
        res.send({error: err})
      }
      else if (status) {
        res.send({statusCode: 500});
      } else {
        result.push(info);
        //send result array when prompt amount is hit
        if (result.length === req.body.numPrompt-3) {
          var typeTest = {
            name: 'Typing Challenge!',
            description: 'Complete the following phrase as quickly as you can.',
            session: {
              type: 'typing',
              expression: Typing[Math.floor(Math.random() * Typing.length)]
            }
          }
          result.push(typeTest);
          var multiChoice = {
            name: 'Multiple Choice Challenge!',
            description: 'Answer the question by submitting the correct answer.',
            session: MultiQuestions[questArray[0]]
          }
          result.push(multiChoice);
          var multiChoice2 = {
            name: 'Multiple Choice Challenge!',
            description: 'Answer the question by submitting the correct answer.',
            session: MultiQuestions[questArray[1]]
          }
          result.push(multiChoice2);
          var shuffled = shuffle(result);
          res.send(shuffled);
        }
      }
    });
  }
};

module.exports.submitAttempt = function(req, res) {
  // var project_id = '5727dcf97fc662c6970009e2';
  // var solution_id = '5727dcf90838ffce0f000918';

  //add to options for post query
  var options = { method: 'POST',
    url: 'https://www.codewars.com/api/v1/code-challenges/projects/' +
          req.body.project_id +
          '/solutions/' +
          req.body.solution_id +
          '/attempt',
    headers:
     {
       'cache-control': 'no-cache',
       'content-type': 'application/json',
       output_format: 'raw',
       authorization: process.env.cwKey
     },
    body: { code: req.body.code }, // 'function greet(){return \'hello world\'}'
    json: true };
  //post
  request.post(options, function(err, response, body) {
    if (err) {
      return console.error('failed', err);
    }
    if (body.success) {
      var innerOptions = {
        url: 'https://www.codewars.com/api/v1/deferred/' +
        body.dmid,
        headers: {
          Authorization: process.env.cwKey
        }
      }
      setTimeout(function() {
          request.get(innerOptions, function(err, response, innerBody) {
            if (err) {
              return console.error('failed defer', err);
            }
          res.send({response: innerBody, setup: req.body.code});
        });
      }, 1500);
    }
  });
};

module.exports.joinGame = function(req, res) {

};

module.exports.createGame = function(req, res) {
  var player = {
    user_id: req.body.user_id,
    progress: 0,
    prompt: '',
    code: ''
  }
  var newGame = {
     roomname: req.body.roomname,
     password: req.body.password,
     players: [player],
     creator: req.body.user_id,
     difficulty: req.body.difficulty,
     prompts:[]
  }

  var result = [];
  var randomArray = [];
  //generate random indexes for prompts
  //currently use 4 because only 4 prompts each difficulty
  for (var i = 0; i < 5; i++) {
    randomArray.push(i);
  }
  //randomize the prompts
  randomArray = shuffle(randomArray);
  for (var i = 0; i < req.body.numPrompts; i++) {
    index = randomArray[i];
    //make the calls to generate prompts
    grabPrompt(req.body.difficulty, index, function(err, status, info) {
      if(err){
        res.send({error: err})
      }
      else if(status){
        res.send({statusCode: 500});
      } else {
        result.push(info);
        //send result array when prompt amount is hit
        if (result.length === req.body.numPrompts) {
          newGame.prompts = result;
          Game.filter({roomname: req.body.roomname}).run()
          .then(function (games) {
            var game = games[0];
            if(game) {
              return new Error('Game already exists');
            } else {
              Game.save(newGame)
              .then(function (game) {
                res.send(game);
              })
              .catch(function (err) {
                res.send({statusCode: 500});
              });
            }
          });
        }
      }
    });
  }


};

module.exports.getUserInfo = function(req, res) {
  User.filter({user_id: req.body.user_id}).run()
    .then(function (users) {
      var user = users[0];
      if(user) {
        res.send(user);
      } else {
        res.send(null);
      }
    })
    .catch(function (err) {
      return null;
    });
};
