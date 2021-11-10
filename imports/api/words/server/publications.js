import { Meteor } from 'meteor/meteor';
import { Words } from '../words.js';
import { Players } from '../../players/players.js';

Meteor.publish('words', function() {
  return Words.find({});
});

//server-side methods

Meteor.methods({
	destroyWords(_env){
		// delete story
	  	Words.remove({env:_env})
	},


	letterHarvestCall(_env, _letterId ,_word, _letter, _aiguebename){
		Words.update({env:_env, "data.name":_word}, {$push : {"data.$.harvestedLetters" : _letter} })

		inventory = Words.find({env:_env}).fetch()[0].data
		const result = inventory.find( ({ name }) => name === _word );

		console.log("word", _word.length, _word)
		console.log("harvest", result.harvestedLetters.length, result.harvestedLetters)

		if (result.harvestedLetters.length == _word.length) {
			console.log("GOTTA KILL DAT WORD")
			Players.update({env:_env, "players.aiguebename":_aiguebename}, {$push : {["players.$.score.harvest"] : _word}})
			sendMessage({action:"killLetter", letterId:_letterId, env:_env, lastLetter : true})
		}else{
			sendMessage({action:"killLetter", letterId:_letterId, env:_env})
		}

	}
})