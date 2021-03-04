import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const GlobalsProd = new Mongo.Collection('globalsProd');
export const GlobalsDev = new Mongo.Collection('globalsDev');

export const globalsSchema = new SimpleSchema({
	// stories should be an object with at least
	// one "line" string, which is the text that's going 
	// to be displayed on people's screens, in french

	// and a params array of objects containing all the optional
	// instructions to be carried out at the same time
	// as that one line of text is displayed, as well as other
	// langages, etc.
  spacebar: {
    type: String
  }
}).newContext();