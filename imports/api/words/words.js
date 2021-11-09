import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Words = new Mongo.Collection('words');

export const wordsSchema = new SimpleSchema({
  // there are two stories objects : one dev & one prod.
  // these objects contain a data array, containing
  // objects with a line param,
	// and a params array of objects containing all the optional
	// instructions to be carried out at the same time
	// as that one line of text is displayed, as well as other
	// langages, etc.
  
  env: {
    type: String,
    allowedValues: ['Dev', 'Prod']
  },

  data:{
    type: Array
  },

  'data.$':{
    type: Object,
    blackbox : true
  },

  'data.$.name': {
    type: String
  },

  'data.$.text': {
    type: String
  },

  'data.$.citation': {
    type: String
  },

  'data.$.author': {
    type: String
  }

}).newContext();