import { Meteor } from 'meteor/meteor';

import { GlobalsDev } from '../globals.js';
import { GlobalsProd } from '../globals.js';

Meteor.publish('globals.prod', function() {
  return GlobalsProd.find({});
});

Meteor.publish('globals.dev', function() {
  return GlobalsDev.find({});
});