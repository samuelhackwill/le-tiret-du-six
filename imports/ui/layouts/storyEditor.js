import Parser from 'simple-text-parser';
import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './storyEditor.html';

// components used inside the template
import '../components/editorBox.js';


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

	lines(){
		if (!Template.instance().subscriptionsReady()) {
			return ["?"]
		}else{
			if (environment=="dev") {
				return StoryDev.find({})
			}else{
				return StoryProd.find({})
			}
		}
	}
})