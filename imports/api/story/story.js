import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const StoryDev = new Mongo.Collection('storyDev');
export const StoryProd = new Mongo.Collection('storyProd');

export const storySchema = new SimpleSchema({
	// stories should be an object with at least
	// a "line" string, which is the text that's going 
	// to be displayed on people's screens, in french

	// and a params object containing all the optional
	// instructions to be carried out at the same time
	// as the text is displayed, as well as other
	// langages, etc.
	obj: {
		type : Object
	},
  'obj.line': {
    type: String
  },  
  'obj.params':{
    type: Object,
  	// is optionnal
  	optional: true,
  	// do not validate what's in the object
  	blackbox : true
  }
}).newContext();