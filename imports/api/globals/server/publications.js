import { Meteor } from 'meteor/meteor';
import { Globals } from '../globals.js';

Meteor.publish('globals', function() {
  return Globals.find({});
});