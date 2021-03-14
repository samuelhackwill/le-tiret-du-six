import { Story } from './story.js';
import { storySchema } from './story.js';

Meteor.methods({
	async storyLineInsert(_obj, _env){
		// REFACTOR THIS GUY
		// check that object conforms to the schema defined in story.js
		obj = {env:_env, data:_obj}
		storySchema.validate(obj);

		// if it's valid, do something and return something when you're done.
		// if it's not, throw the relevent error stack
		if(storySchema.isValid()){
			Story.insert({env:obj.env, data:obj.data})
			return("successfull db insertion")
		}else{
			throw new Meteor.Error("validation error during db insert", storySchema.validationErrors())
		}
	},

	destroyStory(_env){
	  	Story.remove({env:_env})
	}
});