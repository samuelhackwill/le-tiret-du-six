import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Story } from '../../api/story/story.js';
import { Globals } from '../../api/globals/globals.js';
import { Players } from '../../api/players/players.js';

// streamer is for fast paced interactivity
import { streamer } from '../../api/streamer/streamer.js';

import './show.html';
import './show.css';

// components
import '../components/reader.js';
import '../components/racer.js';

streamer.on('message', function(message) {
	// only run if from show layout. Didn't find another way of doing it
	// as streamer seems to be a global object and runs everywhere.
	if(FlowRouter.getRouteName() == "show" && message.env == environment){
		switch (message.action){
			case "adminSpacebarPress":
			adminNext(message.adminAtIndex)
			break;

			case "updateRunners":
			// redrawPlayers is located in racer.js
		    redrawPlayers(message._posTable);
			break;

			case "endRace":
			// at the end of the race, we want to hide the running peeps,
			// change the winner text according to results of race (Michèle Planche
			// should be seated left (jardin) and show the winner div.
			document.getElementsByClassName("racerContainer")[0].style.opacity=0
			displayMessage = message.winner == "Michèle Planche" ? "gauche" : "droite"
			document.getElementsByClassName("winner")[0].innerHTML = "🏁 personne de "+ displayMessage + " wins! 🏁"
			document.getElementsByClassName("winner")[0].style.opacity=1
			document.getElementsByClassName("winner")[0].style.transform = "translate(-50%,-50%) scale(200%)"

			Meteor.setTimeout(function(){
				// shortly after the race has ended, hide the winner div
				// and make the spacebar capable of fetching text again.
				instance.data.obj.spaceBarStatus="reader"
				document.getElementsByClassName("winner")[0].style.opacity=0
				document.getElementsByClassName("readerContainer")[0].style.opacity=1
			},5000)
			break;

			case "stopMining":
			stopMining();
		}
	}
});


Template.show.onCreated(function(){
	// environment can either be "Prod" or "Dev"
	_environment = FlowRouter.getParam("environment")
	environment = _environment.charAt(0).toUpperCase()+_environment.slice(1)
	// either subscribe to dev or prod DB, defaults to dev in case
	// of erroneous query.
	if (environment!="Dev" && environment!="Prod") {
		environment="Dev"
	}

	this.subscribe('players', ()=>{
		// insert a new player
		playerInit()
	});
	this.subscribe('story');
	this.subscribe('globals');
})

Template.show.onRendered(function(){
	window.addEventListener("beforeunload", function (e) {
		// when the window is closed, remove player from db.
		playerRm()
	});

	instance.data.obj.spaceBarStatus = "reader"
	// spacebar status defaults to "reader" mode, 
	// in which it is used to fetch text.

	document.onkeyup = function(event){
		if (event.keyCode==32) {
			// keyCode == 32 is the spacebar.
			switch(instance.data.obj.spaceBarStatus){
			    // check what the spacebar is used for at the moment
				case "racer":
					// if the second race at the end of ACTE I has started,
					// spacebar should be used to update the posTable on
					// the server.
					Meteor.call("requestStepServerSide", instance.aiguebename)
					// image cycler is located in racer.js
					imageCycler(instance.aiguebename)
				break;

				default:
					// most of the time though, spacebar is used to
					// fetch new lines of text.
					clientNext()
				break;
			}
		}
	}

	document.onkeydown = function(event){
		if (event.keyCode==32){
			// we need to prevent default spacebar scroll as we're already
			// scrolling with javascript.
			event.preventDefault()
		}
	}

})

Template.show.helpers({
	showData(){
		/* @todo why is the component rendering with too much data?
		* @body I don't understand why i can access the "Prod" object 
		*/
		// this returns the story from the db and sends
		let obj = {
			story : Story.find({"env":environment}),
			globals : Globals.find({"env":environment}),
			players : Players.find({"env":environment})
		}
		return{obj}
	},
})

playerInit = async function(obj){
	try{
		// playerInsert inserts a new user in the db
		// with default values generated by autoValue
		// as described in the schema, and eventualy
		// with additionnal values if the function
		// is called with an argument (obj).
		let result = await Meteor.callPromise('playerInsert', environment, obj||{players:[{}]})
		// stuff the playerId in instance for further use.
		Object.assign(instance, {aiguebename : result.data.players[0].aiguebename})
	}catch (error){
		console.log(error)
	}
}

playerRm = async function(){
	try{
		// get current environment : prod or dev
		_env = FlowRouter._current.params.environment
		// instance.aiguebename is loaded on playerInit
		await Meteor.callPromise('playerDestroy', _env, instance.aiguebename)
	}catch (error){
		console.log(error)
	}
}