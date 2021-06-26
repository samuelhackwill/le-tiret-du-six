import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Globals = new Mongo.Collection('globals');

export const globalsSchema = new SimpleSchema({
  env : {
  type : String,
    allowedValues: ['Dev', 'Prod']
  },

  spacebar: {
    type: Object
  },

  'spacebar.$': Object,

  'spacebar.$.control' : {
  	type: String
  },

  'spacebar.$.adminAtIndex' : {
  	type : Number
  },

  'serverIp' : Number
  
}).newContext();