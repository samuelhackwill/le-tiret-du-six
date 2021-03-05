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
  aiguebename: { 
  		type:String,
  		autoValue:function() {  
      		console.log(this)
      		return "agagaga"
  	}
  }
}).newContext();