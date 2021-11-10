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
		_params = _letterId.match(/([A-zÀ-ÿ]+)\W([A-zÀ-ÿ])/)
		_word = _params[1]
		_letter = _params[2]

		Words.update({env:_env, "data.name":_word}, {$push : {"data.$.harvestedLetters" : _letter} })

		sendMessage({action:"killLetter", letterId:_letterId, env:_env})
	}
})