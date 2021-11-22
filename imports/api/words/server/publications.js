import { Meteor } from 'meteor/meteor';
import { Words } from '../words.js';
import { Players } from '../../players/players.js';

// we're keeping count of harvested words 
// to end the mining mini-game when no words
// are left. I'm using a variable rather than
// querying the DB because i'm lazy
let harvestedWordsCounter = 0

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

		if (result.harvestedLetters.length == _word.length) {
			Players.update({env:_env, "players.aiguebename":_aiguebename}, {$push : {["players.$.score.harvest"] : _word}})
			sendMessage({action:"killLetter", letterId:_letterId, env:_env, lastLetter : true})
			sendMessage({action:"harvestWord", word:_word, aiguebename:_aiguebename, env:_env})

			harvestedWordsCounter = harvestedWordsCounter +1
			if (harvestedWordsCounter >= inventory.length) {
				harvestedWordsCounter = 0
				console.log("MINING SHOULD PROBABLY BE OVER!")
			}

		}else{
			sendMessage({action:"killLetter", letterId:_letterId, env:_env})
		}

	}
})