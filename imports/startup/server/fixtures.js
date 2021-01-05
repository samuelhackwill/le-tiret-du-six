import { Meteor } from 'meteor/meteor';
import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';

Meteor.startup(() => {
  if (StoryDev.find().count() === 0) {
  	console.log("StoryDev db is empty, inserting document to avoid errors")
  	StoryDev.insert({line:"test"})
  }

  if (StoryProd.find().count() === 0) {
  	console.log("StoryProd db is empty, inserting document to avoid errors")
  	StoryProd.insert({line:"test", params:{"EN": "uk test"}})
  }
});