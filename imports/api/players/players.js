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
	// we have exactly two items in the collection,
	// dev & prod.
	env : {
		type : String,
	    allowedValues: ['Dev', 'Prod']
		},

	// these items both have a players array,
	// containing "players" objects.
	players : {
		type : Array
	},

	// we are not strictly validating what's inside
	// of the players objects yet, as we want it 
	// open for future developpement.
	'players.$':{
	type: Object,
	blackbox : true
	},

	'players.$.aiguebename':{
  		type:String,
		autoValue: function(){
			// autovalue's job is to assign an aiguebename on
			// insert without input from the client.
			collectionSize = Players.find({env:"Dev"}).fetch()[0].players.length
			// return the appropriate aiguebename or the default string
			return aiguebenames[collectionSize] || "Aiguebnames exhausted.";
		}
	},

	'players.$.atIndex':{
		type:Number,
		autoValue: function(){
			return 0;
		}
	}
}).newContext();