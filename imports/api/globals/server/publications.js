import { Meteor } from 'meteor/meteor';
import { Globals } from '../globals.js';
import { Players } from '../../players/players.js';
import { Words } from '../../words/words.js';

Meteor.publish('globals', function() {
  return Globals.find({});
});


// server-side methods

Meteor.methods({
	// we need this function to be server side as it modifies
	// several documents.
	spacebarAdmin(_env, _atIndex){
		object = Globals.find({env:_env}).fetch()[0]
		Globals.update(object._id, { $set: {
		    spacebar:{control: object.spacebar.control, adminAtIndex:_atIndex}
		}})

		// we need to update the players,
		// because that's what is watched by the tracker component.
		Players.update({env:_env}, {$set : {"players.$[].atIndex" : _atIndex} })

		sendMessage({action:"adminSpacebarPress", adminAtIndex:_atIndex, env:_env})
	},

	closeAllWordsBank(_env){
		sendMessage({action:"closeAllWordsBank", env:_env})
	},

	stopMiningAdmin(_env){
		// we need to reset the status of havested letters so that words
		// will appear red and we can start over next time.
		Words.update({ env:_env },
	  { "$set": { "data.$[].harvestedLetters": [] } },
	  { "multi": true }
	)
		sendMessage({action:"stopMining", env:_env})
	}
})