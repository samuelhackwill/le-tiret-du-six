import { Players } from './players.js';
import { playersSchema } from './players.js';

Meteor.methods({
	async playerInsert(_env, obj){
		// check that object conforms to the schema defined in players.js
		playersSchema.validate(obj);

		console.log("player insert ",_env, obj)

		// if it's valid, do something and return something when you're done.
		// if it's not, throw the relevent error stack
		if(playersSchema.isValid()){
			Players.update({env:_env},{ $push: { players: obj } })
			return "sucessful db insertion"
		}else{
			throw new Meteor.Error("validation error during db insert", playersSchema.validationErrors())
		}
	},
});