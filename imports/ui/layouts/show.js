import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';
import { GlobalsDev } from '../../api/globals/globals.js';
import { GlobalsProd } from '../../api/globals/globals.js';
import { Players } from '../../api/players/players.js';

// for testing purposes
import { playersSchema } from '../../api/players/players.js';

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
	this.subscribe('players');

// for testing purposes
	_playersSchema = playersSchema

})



playerInsert = async function(obj){
	try{
		// get current environment : prod or dev
		_env = FlowRouter._current.params.environment
		console.log("playerInsert first ", _env)
		// meteor async call
		await Meteor.callPromise('playerInsert', _env, obj)
	}catch (error){
		console.log(error)
	}
}