import { Meteor } from 'meteor/meteor';
import { Story } from '../story.js';

Meteor.publish('story', function() {
  return Story.find({});
});