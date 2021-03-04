import { Meteor } from 'meteor/meteor';
import { StoryDev } from '../story.js';
import { StoryProd } from '../story.js';

Meteor.publish('story.Prod', function() {
  return StoryProd.find({});
});

Meteor.publish('story.Dev', function() {
  return StoryDev.find({});
});