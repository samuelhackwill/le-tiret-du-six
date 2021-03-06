import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Players = new Mongo.Collection('players');

// probably for debugging purposes, assign a name i know to 
// every player. (will help identifying a computer in 
// debug mode maybe?).
const aiguebenames = ["Michèle Planche", "Julien Montfalcon", 
"Lydia Guhl", "Régis Montfalcon", "Chantal Montfalcon", 
"Roger Bologne", "Silvia Cremonte", "Dominique Sommeveille", 
"Anna Karin Tabarand", "Gerald Fillias", "Madeleine Curtaud", 
"Daniel Duval", "Joelle Rollin", "André Guillet", 
"Colette Lasherme", "Jeremy Bottan", "Claire Roussey-Simon",
"Julian Boutin", "Ginette", "Anthelme Branche", "Romain Chavet",
"Yvette Regnier", "Le Biclou", "Patricia François",
 "Jean-Jacques Amouyal", "Raymond Gentil-Beccot", 
 "Pamela Hermant", "Véronique Chatard", "Cyrille Colombier",
 "Florian Montfalcon", "Anna-Karin Tabarand", 
 "Solange Barret", "Jacky Duport", "Michel Gatellier"]

export const playersSchema = new SimpleSchema({
	env : {
		type : String,
	    allowedValues: ['Dev', 'Prod']
		},
	// players : { type: Object },

	players : {
		type : Array
	},

	'players.$':{
	type: Object,
	blackbox : true
	// do not validate what's in the array for the moment :
	// we want it to be open for future development, noSQL style
	},

	'players.$.aiguebename':{
  		type:String,
		autoValue: function(){
		return "Hello, " + this.field('name').value;
		}
	}
}).newContext();