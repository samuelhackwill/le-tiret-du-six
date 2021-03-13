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

	}
});
