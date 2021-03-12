import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';
import { Globals } from '../../api/globals/globals.js';

import './admin.html';
import './admin.css';

// components used inside the template
import '../components/editor.js';
import '../components/bookmarksLibrary.js';
import '../components/spacebarControl.js';

Template.admin.onCreated(function storyEditorOnCreated() {
	// environment can either be "prod" or "Dev"
	_environment = FlowRouter.getParam("environment")
	environment = _environment.charAt(0).toUpperCase()+_environment.slice(1)
	// either subscribe to dev or prod DB, defaults to dev in case
	// of erroneous query.
	if (environment!="Dev" && environment!="Prod") {
		environment="Dev"
	}

	this.subscribe(`story.${environment}`);
	this.subscribe('globals',()=>{
		// sync local atIndex to DB when arriving
		instance.data.adminAtIndex = instance.data.global.collection.find({env:environment}).fetch()[0].spacebar.adminAtIndex
	});

	instance = this
	testing = StoryDev
});

Template.admin.helpers({
	story(){
		if (environment=="Dev") {
			return{
				story:StoryDev.find({})}
		}else{
			return{
				story:StoryProd.find({})}
		}
	},

	bookmarks(){
	// this returns only fields of the DB
	// with one "bookmark" param.
		if (environment=="Dev") {
			return{
				bookmarks:StoryDev.find({params: {$elemMatch: {"#bookmark": { $exists: true}}}})
			}
		}else{
			return{
				bookmarks:StoryProd.find({params: {$elemMatch: {"#bookmark": { $exists: true}}}})
			}
		}
	},

	globals(name){
	// this returns one named global (passed from the HTML)
		return{
			global:Globals.find({env:environment, [name]:{$exists:true}})
		}
	}
})
