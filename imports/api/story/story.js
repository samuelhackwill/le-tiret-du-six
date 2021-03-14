import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Story = new Mongo.Collection('story');

export const storySchema = new SimpleSchema({
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

  'data.$.line': {
    type: String
  },  
  'data.$.params':{
    type: Array,
  	// is optionnal
  	optional: true,
  },
  'data.$.params.$':{
    type: Object,
    blackbox : true
    // do not validate what's in the array :
    // we want it to be open for future development, noSQL style
  }
}).newContext();