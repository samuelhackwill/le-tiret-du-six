import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const StoryDev = new Mongo.Collection('storyDev');
export const StoryProd = new Mongo.Collection('storyProd');

export const storySchema = new SimpleSchema({
	// stories should be an object with at least
	// one "line" string, which is the text that's going 
	// to be displayed on people's screens, in french

	// and a params array of objects containing all the optional
	// instructions to be carried out at the same time
	// as that one line of text is displayed, as well as other
	// langages, etc.
  line: {
    type: String
  },  
  params:{
    type: Array,
  	// is optionnal
  	optional: true,
  },
  'params.$':{
    type: Object,
    blackbox : true
    // do not validate what's in the array :
    // we want it to be open for future development, noSQL style
  }
}).newContext();