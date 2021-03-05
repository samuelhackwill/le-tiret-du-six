import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const GlobalsProd = new Mongo.Collection('globalsProd');
export const GlobalsDev = new Mongo.Collection('globalsDev');

export const globalsSchema = new SimpleSchema({
  spacebar: {
    type: String
  }
}).newContext();