import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Story } from '../../api/story/story.js';
import { Words } from '../../api/words/words.js';
import { Globals } from '../../api/globals/globals.js';
import { Players } from '../../api/players/players.js';

// streamer is for fast paced interactivity
import { streamer } from '../../api/streamer/streamer.js';

import './show.html';
import './show.css';

// components
import '../components/reader.js';
import '../components/racer.js';
import '../components/wordsBank.js';

streamer.on('message', function(message) {
	// only run if from show layout. Didn't find another way of doing it
	// as streamer seems to be a global object and runs everywhere.
	if(FlowRouter.getRouteName() == "show" && message.env == environment){
		switch (message.action){
			case "killLetter":
			// killLetter(letterId, local)
			// the first argument is the id of the letter to fade out,
			// the second argument is false when it's a server call (like now)
			// and true when the function was called by a click event (locally).
			// the third argument is true or false, it's to know when it's 
			// the last letter which was harvested and thus we must kill the whole
			// word.
			killLetter(message.letterId, false, message.lastLetter)
			break;

			case "harvestWord":
			if (message.aiguebename == instance.aiguebename) {
				console.log("wouhouuu you've got a new word!")
				$('.toggleWordsBank').css("color", "grey");
			}
			break;

			case "adminSpacebarPress":
			adminNext(message.adminAtIndex)
			break;

			case "updateRunners":
			// redrawPlayers is located in racer.js
		    redrawPlayers(message._posTable);
			break;

			case "endRaceSolo":
			// the first solo race is when people train against a bot. We are
			// having a multitude of races at the same time, so we need to check
			// wether this is a message for one player or not. Also, if the bot
			// is the one who finished the race, we need to log the score
			// of the player because it won't be done on the server side.
			// on every new race finish EXCEPT that of the bot,
			// we're going to update the mean.
			console.log("endRace ", instance.soloRaceFinished === true, message.winner !== instance.aiguebename, message.winner !== "bot")
			if (instance.soloRaceFinished === true || message.winner !== instance.aiguebename && message.winner !== "bot" ) {
				// if the race was already locally finished, or the endrace message
				// is for another player, don't do anything!
				console.log("not for me, returning!")
				return
			}else{
				// in case of endace for a bot, we need to end the race
				// but also to log the score of the player immediately,
				//  because he/she won't
				// be able to reach the end of the racetrack.
				if (message.winner == "bot") {
					console.log("the bot has won, stop!")
					displayMessage = "vous avez perdu la course!"
					Meteor.call("playerLogTime", _env = environment, _aiguebename = instance.aiguebename, _whichRace = "race2")
					// the bot has to go.
				}else{
					console.log("i have won, stop!")
					// if it wasn't a bot, it means it was you.
					// bravo!
					displayMessage = "vous avez gagné la course!"
				}

				// log the state of the race : it is finished.
				instance.soloRaceFinished = true

				// html stuff to display the winning message
				document.getElementsByClassName("winner")[0].innerHTML = "🏁 "+ displayMessage + " 🏁"
				document.getElementsByClassName("winner")[0].style.opacity=1
				document.getElementsByClassName("winner")[0].style.transform = "translate(-50%,-50%) scale(200%)"
				document.getElementsByClassName("racerContainer")[0].style.opacity=0

				setTimeout(function(){
					// shortly after the race has ended, hide the winner div
					// and make the spacebar capable of fetching text again.
					instance.data.obj.spaceBarStatus="reader"
					document.getElementsByClassName("winner")[0].style.opacity=0
					document.getElementsByClassName("readerContainer")[0].style.opacity=1

					allRunners = document.getElementsByClassName("runner")
					for (var i = allRunners.length - 1; i >= 0; i--) {
						allRunners[i].style.left="0%";
					}
				},5000)
			}
			break;

			case "crossLinePool":
			// the other races are when the spacebar athletes & the team sieste
			// compete against one another. When a player crosses the line,
			// we need to log the score in a reactive variable somewhere
			// so that the helper in charge of displaying score is triggered.
			console.log("someone just crossed the line!")
			break;


			case "endRacePool":
			switchToReaderAndResetRunners()
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
	this.subscribe('words');
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

		if(event.keyCode==49){
			// &
			Meteor.call("showServerCall", false, environment, false)
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
			words : Words.find({"env":environment}),
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

playerRm = async function(optionalName){
	_who = optionalName || instance.aiguebename
	console.log("REMOVING PLAYER ", _who)
	try{
		// get current environment : prod or dev
		_env = FlowRouter._current.params.environment
		// instance.aiguebename is loaded on playerInit
		await Meteor.callPromise('playerDestroy', _env, _who)
	}catch (error){
		console.log(error)
	}
}

switchToReaderAndResetRunners = function(){
	document.getElementsByClassName("readerContainer")[0].style.opacity=1
	document.getElementsByClassName("racerContainer")[0].style.opacity=0

	setTimeout(function(){
		allRunners = document.getElementsByClassName("runner")
		for (var i = allRunners.length - 1; i >= 0; i--) {
			allRunners[i].style.left="0%";
		}
	},3000)

}
