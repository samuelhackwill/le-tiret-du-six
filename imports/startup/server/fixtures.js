import { Meteor } from 'meteor/meteor';

import { Story } from '../../api/story/story.js';
import { Globals } from '../../api/globals/globals.js';
import { Players } from '../../api/players/players.js';

var os = require('os')
// we're using this lib to get the server's IP

Meteor.startup(() => {
  // insert vital stuff in the dbs at startup
  // if the dbs are empty.

  if (Story.find().count() === 0) {
    initiateStory()
  }

  if (Globals.find().count() === 0) {
  	console.log("Globals db is empty, inserting document to avoid errors")
    Globals.insert({env:"Dev", spacebar:{"control":"client", "adminAtIndex":-1}})
    Globals.insert({env:"Prod", spacebar:{"control":"client", "adminAtIndex":-1}})
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

  console.log(result)

  // push result to temp collection
  Globals.update({env:"Temp"},{ $push: { "serverIp": result[0].address } })

};