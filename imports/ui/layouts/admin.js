import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Story } from '../../api/story/story.js';
import { Globals } from '../../api/globals/globals.js';
import { Players } from '../../api/players/players.js';

import './admin.html';
import './admin.css';

// components used inside the template
import '../components/editor.js';
import '../components/bookmarksLibrary.js';
import '../components/spacebarControl.js';
import '../components/tracker.js';

Template.admin.onCreated(function storyEditorOnCreated() {
	// environment can either be "prod" or "Dev"
	_environment = FlowRouter.getParam("environment")
	environment = _environment.charAt(0).toUpperCase()+_environment.slice(1)
	// either subscribe to dev or prod DB, defaults to dev in case
	// of erroneous query.
	if (environment!="Dev" && environment!="Prod") {
		environment="Dev"
	}

	this.subscribe('story')
	this.subscribe('globals',()=>{
		// sync local atIndex to DB when arriving
		instance.data.adminAtIndex = instance.data.global.collection.find({env:environment}).fetch()[0].spacebar.adminAtIndex
	});	
	this.subscribe('players')
	
	instance = this


});

Template.admin.helpers({
	story(){
		return{
			story:Story.find({env: environment})
		}
	},

	bookmarks(){
	// this returns only fields of the DB
	// with one "bookmark" param.
		return{
			bookmarks:Story.find({env:"Dev", 'data.params':{$elemMatch:{"#bookmark":{$exists:true}}} }),
			story:Story.find({})
		}
	},

	globals(name){
	// this returns one named global (passed from the HTML)
		return{
			global:Globals.find({env:environment, [name]:{$exists:true}})
		}
	},

	players(){
	// this returns one named global (passed from the HTML)
		return{
			players:Players.find({env:environment})
		}
	},
})
