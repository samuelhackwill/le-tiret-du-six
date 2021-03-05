import { Players } from './players.js';
import { playersSchema } from './players.js';

Meteor.methods({
	playerInsert(obj){
		// check that object conforms to the schema defined in story.js
		playersSchema.validate(obj);

		// if it's valid, do something and return something when you're done.
		// if it's not, throw the relevent error stack
		if(playersSchema.isValid()){
			return("not doing anything for the moment.")
		}else{
			throw new Meteor.Error("validation error during db insert", playersSchema.validationErrors())
		}
	},
});