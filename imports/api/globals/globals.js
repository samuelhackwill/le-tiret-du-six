import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const GlobalsProd = new Mongo.Collection('globalsProd');
export const GlobalsDev = new Mongo.Collection('globalsDev');

export const globalsSchema = new SimpleSchema({
  spacebar: {
    type: Object
  },

  'spacebar.$': Object,

  'spacebar.$.control' : {
  	type: String
  },

  'spacebar.$.adminAtIndex' : {
  	type : Number
  }
}).newContext();