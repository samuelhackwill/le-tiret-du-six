import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Globals = new Mongo.Collection('globals');

export const globalsSchema = new SimpleSchema({
  env : {
  type : String,
    allowedValues: ['Dev', 'Prod', 'Temp']
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

  // this is a state-tracking boolean, which causes the admin view (flexHudContainer)
  // to flash red lights, in order to attract attention in the room.
  showServerStrobe : Boolean

}).newContext();