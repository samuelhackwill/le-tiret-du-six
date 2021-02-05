import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';

import './storyEditor.html';

// components used inside the template
import '../components/lineComponent.js';


Template.storyEditor.onCreated(function storyEditorOnCreated() {
	// environment can either be "prod" or "dev"
	environment = FlowRouter.getParam("environment")
	// either subscribe to dev or prod DB, defaults to dev in case
	// of erroneous query.
	if (environment!="dev" && environment!="prod") {
		environment="dev"
	}
	this.subscribe(`story.${environment}`);
});

Template.storyEditor.helpers({

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
				console.log(StoryDev.find({}).fetch())
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