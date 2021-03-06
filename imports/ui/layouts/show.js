import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';
import { Globals } from '../../api/globals/globals.js';
import { Players } from '../../api/players/players.js';

// streamer is for fast paced interactivity
import '../../api/streamer/streamer.js';
import '../../api/streamer/client/streamer.js';

import './show.html';
import './show.css';

// components
import '../components/reader.js';

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
	this.subscribe(`story.${environment}`);
	this.subscribe(`globals`);
})

Template.show.onRendered(function(){
	window.addEventListener("beforeunload", function (e) {
		// when the window is closed, remove player from db.
		playerRm()
	});
})

Template.show.helpers({
	showData(){
		// this returns the story from the db and sends
		let obj = {
			story : StoryDev.find({}),
			globals : Globals.find({env:environment})
		}
		return{obj}
	},
})

playerInit = async function(obj){
	try{
		// get current environment : prod or dev
		_env = FlowRouter._current.params.environment
		// playerInsert inserts a new user in the db
		// with default values generated by autoValue
		// as described in the schema, and eventualy
		// with additionnal values if the function
		// is called with an argument (obj).
		let result = await Meteor.callPromise('playerInsert', _env, obj||{players:[{}]})
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