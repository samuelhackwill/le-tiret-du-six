import { StoryDev } from './story.js';
import { StoryProd } from './story.js';
import { storySchema } from './story.js';

Meteor.methods({
	async storyLineInsert(obj){
		// check that object conforms to the schema defined in story.js
		storySchema.validate({obj});

		// if it's valid, do something and return something when you're done.
		// if it's not, throw the relevent error stack
		if(storySchema.isValid()){
			return("successfull db insertion")
		}else{
			throw new Meteor.Error("validation error during db insert", storySchema.validationErrors())
		}
	}
});