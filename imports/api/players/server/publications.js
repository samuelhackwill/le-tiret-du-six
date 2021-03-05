import { Meteor } from 'meteor/meteor';
import { Players } from '../players.js';

Meteor.publish('players', function() {
  return Players.find({});
});