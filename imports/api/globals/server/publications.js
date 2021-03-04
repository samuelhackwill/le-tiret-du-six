import { Meteor } from 'meteor/meteor';
import { GlobalsDev } from '../globals.js';
import { GlobalsProd } from '../globals.js';

Meteor.publish('globals.Prod', function() {
  return GlobalsProd.find({});
});

Meteor.publish('globals.Dev', function() {
  return GlobalsDev.find({});
});