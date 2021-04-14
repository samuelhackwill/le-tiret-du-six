import { Meteor } from 'meteor/meteor';
import { Story } from '../story.js';

Meteor.publish('story', function() {
  return Story.find({});
});

//server-side methods

Meteor.methods({
	destroyStory(_env){
		// delete story
	  	Story.remove({env:_env})
	}
})