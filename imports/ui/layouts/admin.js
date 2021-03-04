import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';

import './admin.html';
import './admin.css';

// components used inside the template
import '../components/editor.js';
import '../components/bookmarksLibrary.js';
import '../components/spacebarControl.js';

Template.admin.onCreated(function storyEditorOnCreated() {
	// environment can either be "prod" or "dev"
	environment = FlowRouter.getParam("environment")
	// either subscribe to dev or prod DB, defaults to dev in case
	// of erroneous query.
	if (environment!="dev" && environment!="prod") {
		environment="dev"
	}
	this.subscribe(`story.${environment}`);

	instance = Template.instance()

	testing = StoryDev
});

Template.admin.helpers({
	story(){
	// this returns the story from the db
		if (!instance.subscriptionsReady()) {
			return ["?"]
		}else{
			if (environment=="dev") {
				return{
					story:StoryDev.find({})}
			}else{
				return{
					story:StoryProd.find({})}
			}
		}
	},

	bookmarks(){
	// this returns only fields of the DB
	// with one "bookmark" param.
		if (!instance.subscriptionsReady()) {
			return ["?"]
		}else{
			if (environment=="dev") {
				return{
					bookmarks:StoryDev.find({params: {$elemMatch: {"#bookmark": { $exists: true}}}})
				}
			}else{
				return{
					bookmarks:StoryProd.find({params: {$elemMatch: {"#bookmark": { $exists: true}}}})
				}
			}
		}
	}
})
