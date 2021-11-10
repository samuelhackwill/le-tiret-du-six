import { Meteor } from 'meteor/meteor';
import { Words } from '../words.js';

Meteor.publish('words', function() {
  return Words.find({});
});

//server-side methods

Meteor.methods({
	destroyWords(_env){
		// delete story
	  	Words.remove({env:_env})
	},


	letterHarvestCall(_env, _letterId){
		sendMessage({action:"killLetter", letterId:_letterId, env:_env})
	}
})