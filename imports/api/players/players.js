import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const PlayersDev = new Mongo.Collection('playersDev');
export const PlayersProd = new Mongo.Collection('playersProd');

export const playersSchema = new SimpleSchema({
}).newContext();