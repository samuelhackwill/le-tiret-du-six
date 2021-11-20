import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './tracker.html';
import './tracker.css';

Template.tracker.onCreated(function(){

	var queryPlayers = this.data.players.collection.find();
	queryPlayers.observeChanges({
		changed: function(id, fields){
			Tracker.afterFlush(function () {
				$('.playerPositionMarker').each(function(i,playerPositionMarker){
					let playerAtIndex = $(playerPositionMarker).attr('data-atIndex')
					$(playerPositionMarker).css('top', $('#editorTH span.lineIndex[data-lineIndex="'+playerAtIndex+'"]').get(0).offsetTop)
				})
			});
		}
	})

})


Template.tracker.helpers({

	getAiguebename(){
		// we need to align each cursor with the appropriate row
		// but as every line hasn't got a fixed height,
		// instance.data.offsets contain the exact offsetTop
		// of every line.
		return this.aiguebename;
	},

	getAtIndex(){
		// we need to align each cursor with the appropriate row
		// but as every line hasn't got a fixed height,
		// instance.data.offsets contain the exact offsetTop
		// of every line.
		return this.atIndex;
	},

	cursorColor(){
		// we want to see if michèle & julien are here and
		// have completed the race, because if not it may
		// cause bugs.
		switch(this.aiguebename){
			case "bot":
			return "red"

			default:
			return "white"

			break;
		}

	}
})
