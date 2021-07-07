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

	document.onkeyup = function(event){
		if (event.keyCode==32) {
			// call clientNext() when someone presses spacebar
			clientNext()
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
			globals : Globals.find({"env":environment})
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