import { Meteor } from 'meteor/meteor';
import { Machines } from '../../api/fsm/fsm.js';
import { insert } from '../../api/fsm/methods.js';
import '/imports/api/fsm/server/publications.js'

Meteor.startup(() => {
  if (Machines.find().count() === 0) {
  	console.log("let's fill that mf!")
  	Machines.insert({message:"youhouu"})
  }
});