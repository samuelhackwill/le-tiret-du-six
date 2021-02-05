import { StoryDev } from './story.js';
import { StoryProd } from './story.js';
import { storySchema } from './story.js';

Meteor.methods({
	async storyLineInsert(obj, env){
		// check that object conforms to the schema defined in story.js
		console.log(obj, env)
		storySchema.validate(obj);

		// if it's valid, do something and return something when you're done.
		// if it's not, throw the relevent error stack
		if(storySchema.isValid()){
			if (env=="prod") {
			  	StoryProd.insert({line:obj.line, params:obj.params})
			}else{
			  	StoryDev.insert({line:obj.line, params:obj.params})
			}
			return("successfull db insertion")
		}else{
			throw new Meteor.Error("validation error during db insert", storySchema.validationErrors())
		}
	}
});