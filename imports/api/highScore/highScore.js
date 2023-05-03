import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const HighScore = new Mongo.Collection('highScore');

export const highScoreSchema = new SimpleSchema({
    env : {
        type : String,
        allowedValues: ['Dev', 'Prod', 'Temp']
    },
  
    // genre Subs générale, Subs première, Subs deuxième
    name : {
        type : String
    },

    // utilisé pour se comparer au dernier public qui vient de jouer au tiret du six
    date : {
        type : Date
    },

    // genre 38
    peepCount : {
        type : Number
    },

    // number in milliseconds (en terme de rapidité pour entrer dans la salle vous vous placez en xx position)
    entreePublic : {
        type : Number
    },

    // la dernière fois, ça a duré gnagna.
    ping : {
        type : Number
    },

}).newContext();