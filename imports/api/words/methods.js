import { Words } from './words.js';
import { wordsSchema } from './words.js';

Meteor.methods({
	async wordsLineInsert(_obj, _env){
		obj = {env:_env, data:_obj}
		wordsSchema.validate(obj);

		// if it's valid, do something and return something when you're done.
		// if it's not, throw the relevent error stack
		if(wordsSchema.isValid()){
			Words.insert({env:obj.env, data:obj.data})
			return("successfull db insertion")
		}else{
			throw new Meteor.Error("validation error during db insert", wordsSchema.validationErrors())
		}
	},

	giveWordsToEverybody(_env){
		sendMessage({action:"giveWordsToEverybody", env:_env})
	}
});