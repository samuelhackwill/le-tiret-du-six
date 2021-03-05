import { Meteor } from 'meteor/meteor';
import { PlayersDev } from '../players.js';
import { PlayersProd } from '../players.js';

Meteor.publish('players.Prod', function() {
  return PlayersProd.find({});
});

Meteor.publish('players.Dev', function() {
  return PlayersDev.find({});
});