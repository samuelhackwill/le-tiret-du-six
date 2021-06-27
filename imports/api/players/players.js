import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Players = new Mongo.Collection('players');

// probably for debugging purposes, assign a name i know to 
// every player. (will help identifying a computer in 
// debug mode maybe?).
const aiguebenames = ["Michèle Planche", "Julien Montfalcon", 
"Lydia Guhl", "Régis Montfalcon", "Chantal Montfalcon", 
"Roger Bologne", "Silvia Cremonte", "Dominique Sommeveille", 
"Karin Tabarand", "Gerald Fillias", "Madeleine Curtaud", 
"Daniel Duval", "Joelle Rollin", "André Guillet", 
"Colette Lasherme", "Jeremy Bottan", "Claire Roussey-Simon",
"Julian Boutin", "Ginette", "Anthelme Branche", "Romain Chavet",
"Yvette Regnier", "Le Biclou", "Patricia François",
 "Jean-Jacques Amouyal", "Raymond Gentil-Beccot", 
 "Pamela Hermant", "Véronique Chatard", "Cyrille Colombier",
 "Florian Montfalcon", "Solange Barret", "Jacky Duport", 
 "Michel Gatellier", "Olivier Collomb", "Thierry Bonnamour"]

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
			// this.env is passed to the clean() function which is used in methods.
			collectionSize = Players.find({env:this.env}).fetch()[0].players.length
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

	// the two first player's score during the first race is
	// logged in score.race1.start / finish


}).newContext();