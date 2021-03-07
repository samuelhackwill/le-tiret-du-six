import { Players } from './players.js';
import { playersSchema } from './players.js';

Meteor.methods({
	async playerInsert(_env, obj){
		// clean modifies the object, adding an aiguebename
		// and atIndex = 0 objects.
		cleanedObj = playersSchema.clean(obj)

		console.log("validation ? ",playersSchema.isValid())
		if(playersSchema.isValid()){
			Players.update({env:_env},{ $push: { players: cleanedObj.players[0] } })
			return "sucessful db insertion"
		}else{
			throw new Meteor.Error("validation error during db insert", playersSchema.validationErrors())
		}
	},
});