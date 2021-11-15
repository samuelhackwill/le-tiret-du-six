import { Meteor } from 'meteor/meteor';

import { Story } from '../../api/story/story.js';
import { Globals } from '../../api/globals/globals.js';
import { Players } from '../../api/players/players.js';
import { Words } from '../../api/words/words.js';

var os = require('os')
// we're using this lib to get the server's IP

// we need this counter for the showServerCall (api/players/methods)
// which counts the number of players who have triggered
// it, in order to toggle the admin strobe when the first player
// calls the method, and toggles the strobe off when the last player
// calls the method. Unfortunately it only resets the counter when
// the server reboots ; maybe store it in the "Temp" document in the Globals
// collection instead?
playersCounter = {"Dev":0, "Prod":0}

// this is the stuff we need to initialize the stepper, which is 
// used in the race at the end of ACTE I (second 1v1 race).
stepQueue = []
// stepQueue will contain aiguebenames of the players who
// have pressed the spacebar during the race.
timerStepsInterval = 83
// timerStepsInterval defines the rythm at which the server updates
// the position of every player. Here, at 12 times a second (83).
timerSteps = '';
// timerSteps is the setInterval object, which is cleared at the
// end of the race.
posTable = {}
// posTable contains the X position of every player.


Meteor.startup(() => {
  // insert vital stuff in the dbs at startup
  // if the dbs are empty.

  if (Story.find().count() === 0) {
    initiateStory()
  }

  if (Words.find().count() === 0) {
    initiateWords()
  }

  if (Globals.find().count() === 0) {
  	console.log("Globals db is empty, inserting document to avoid errors")
    Globals.insert({env:"Dev", spacebar:{"control":"client", "adminAtIndex":-1}, showServerStrobe:false})
    Globals.insert({env:"Prod", spacebar:{"control":"client", "adminAtIndex":-1}, showServerStrobe:false})
  }

  if (Players.find().count() === 0) {
    initiatePlayers()
  }

  // flush the temp database
  Globals.remove({env:"Temp"})
  Globals.insert({env:"Temp"})

  // populate the temp database with the ip of the machine 
  // hosting the meteor app (for the "showServer" sequence)
  getIp()

});

initiateWords = function(_env){
    __env = _env || null
  if (__env) {
    console.log("Words."+ __env," is empty, inserting document to avoid errors")
    Words.insert({env:__env, data:[{name:"soudain", text:"c'est le mot préféré des de samuel quand il a plus d'idées", citation:"et soudain, la webapp était plantée.", author:"Albert Einstein (Apocryphe)", harvestedLetters:[]}]})
  }else{
    console.log("Words is empty, inserting document to avoid errors")
    Words.insert({env:"Prod", data:[{name:"soudain", text:"c'est le mot préféré des de samuel quand il a plus d'idées", citation:"et soudain, la webapp était plantée.", author:"Albert Einstein (Apocryphe)", harvestedLetters:[]}]})
    Words.insert({env:"Dev", data:[{name:"soudain", text:"c'est le mot préféré des de samuel quand il a plus d'idées", citation:"et soudain, la webapp était plantée.", author:"Albert Einstein (Apocryphe)", harvestedLetters:[]}]})
  }      
}

initiatePlayers = function(_env){
    // we call this function without arguments when we want to initiate everything,
    // or with a variable "Dev" or "Prod" when we only want to initiate one document.
    // like for instance, from the reboot component.
  __env = _env || null
  if (__env) {
    console.log("Players."+ __env," is empty, inserting document to avoid errors")
    Players.insert({env:__env, players:[]})
  }else{
    console.log("Players is empty, inserting document to avoid errors")
    Players.insert({env:"Dev", players:[]})
    Players.insert({env:"Prod", players:[]})
  }
}

initiateStory = function(_env){
  __env = _env || null
  if (__env) {
    console.log("Story."+ __env," is empty, inserting document to avoid errors")
    Story.insert({env:__env, data:[{line:"test dev", params:[{"EN": "uk test dev"},{"#bookmark":"texte début dev"}]}]})
  }else{
    console.log("Story is empty, inserting document to avoid errors")
    Story.insert({env:"Dev", data:[{line:"test dev", params:[{"EN": "uk test dev"},{"#bookmark":"texte début dev"}]}]})
    Story.insert({env:"Prod", data:[{line:"test", params:[{"EN": "uk test"},{"#bookmark":"texte début"}]}]})
  }      
}

getIp = function() {
  // Get interfaces
  var netInterfaces = os.networkInterfaces();
  // Result
  var result = [];
  for (var id in netInterfaces) {
    var netFace = netInterfaces[id];

    for (var i = 0; i < netFace.length; i++) {
      var ip = netFace[i];
      if (ip.internal === false && ip.family === 'IPv4') {
        result.push(ip);
      }
    }
  }

  // push result to temp collection
  Globals.update({env:"Temp"},{ $push: { "serverIp": result[0].address } })

};