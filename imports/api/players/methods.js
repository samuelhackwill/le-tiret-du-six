import { Players } from './players.js';
import { playersSchema } from './players.js';

Meteor.methods({
	async playerInsert(_env, obj){
		// clean modifies the object, adding an aiguebename
		// and atIndex = 0 objects.
		cleanedObj = playersSchema.clean(obj)
		console.log("new player : ", cleanedObj.players[0].aiguebename)

		if(playersSchema.isValid()){
			Players.update({env:_env},{ $push: { players: cleanedObj.players[0] } })
			return {msg : "successful player insertion!", data : cleanedObj}
		}else{
			throw new Meteor.Error("validation error during db insert", playersSchema.validationErrors())
		}
	},	

	playerDestroy(_env, _aiguebename){
		console.log("player destroy ", _env, _aiguebename)
		Players.update({env:_env},{ $pull: { players: {aiguebename:_aiguebename} } })
		return {msg : "removing player : ", who : _aiguebename}
	},

	spacebarPlayer(_env, _aiguebename, _atIndex){
		console.log(_env, _aiguebename, _atIndex)
		// update player's index so we can track it elsewhere.
		// i'm using a positional argument "$" here to update the one field.
		Players.update({env:_env, "players.aiguebename":_aiguebename}, {$set : {"players.$.atIndex" : _atIndex} })
	},

	playerLogTime(_env, _aiguebename, _whichRace){
		time = new Date()
		console.log(_whichRace)
		// we're looking for a score.start field in the player document.
		// if one exists, it's that the race is already started and that
		// the method was called to log the finish time.

		/* @todo convoluted code : refactor query
  		* @body this query is pretty convoluted and could prob be simplified with a better mongo query 
  		*/ 
		alreadyStarted = Players.find({env:_env, "players.aiguebename":_aiguebename}).fetch()[0].players[0].score?.[_whichRace]?.start

		console.log("is alreadyStarted false?", alreadyStarted)
		startOrFinish = alreadyStarted ? "finish" : "start"

		Players.update({env:_env, "players.aiguebename":_aiguebename}, {$set : {["players.$.score."+_whichRace+"."+startOrFinish] : time} })

	}
});
