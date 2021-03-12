import { Meteor } from 'meteor/meteor';

import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';

import { Globals } from '../../api/globals/globals.js';

import { Players } from '../../api/players/players.js';

Meteor.startup(() => {
  // insert vital stuff in the dbs at startup
  // if the dbs are empty.
  if (StoryDev.find().count() === 0) {
  	console.log("StoryDev db is empty, inserting document to avoid errors")
  	StoryDev.insert({line:"test", params:[{"EN": "uk test"},{"#bookmark":"texte début"}]})
  }

  if (StoryProd.find().count() === 0) {
  	console.log("StoryProd db is empty, inserting document to avoid errors")
  	StoryProd.insert({line:"test", params:[{"EN": "uk test"},{"#bookmark":"texte début"}]})
  } 

  if (Globals.find().count() === 0) {
  	console.log("Globals db is empty, inserting document to avoid errors")
    Globals.insert({env:"Dev", spacebar:{"control":"client", "adminAtIndex":0}})
    Globals.insert({env:"Prod", spacebar:{"control":"client", "adminAtIndex":0}})
  }


  if (Players.find().count() === 0) {
    console.log("Players is empty, inserting document to avoid errors")
    Players.insert({env:"Dev", players:[]})
    Players.insert({env:"Prod", players:[]})
  }
});