import { Meteor } from 'meteor/meteor';
import { StoryDev } from '../story.js';
import { StoryProd } from '../story.js';

Meteor.publish('story.prod', function() {
  return StoryProd.find({});
});

Meteor.publish('story.dev', function() {
  return StoryDev.find({});
});