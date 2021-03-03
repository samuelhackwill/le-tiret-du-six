import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';

import './storyEditor.html';
import './storyEditor.css';

// components used inside the template
import '../components/editor.js';

Template.storyEditor.onCreated(function storyEditorOnCreated() {
	// environment can either be "prod" or "dev"
	environment = FlowRouter.getParam("environment")
	// either subscribe to dev or prod DB, defaults to dev in case
	// of erroneous query.
	if (environment!="dev" && environment!="prod") {
		environment="dev"
	}
	this.subscribe(`story.${environment}`);

	instance = Template.instance()
});

Template.storyEditor.events({

	'click #🗑'(){
		Meteor.call("destroyStory", environment)
	}
})

Template.storyEditor.helpers({

	// this is a css hack to only show the text when db is ready on load.
	subscriptionsReady(){
		if (instance.subscriptionsReady()) {
			return 1;
		}else{
			return 0;
		}
	},

	// for the title of the page
	env(){
		return environment
	},


	// this returns the story from the db
	story(){

		if (!Template.instance().subscriptionsReady()) {
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

	paramsKey(){
		const paramsKey = yo
		return paramsKey
	}

})