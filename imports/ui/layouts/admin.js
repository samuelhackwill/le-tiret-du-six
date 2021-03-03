import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';

import './admin.html';
import './admin.css';

// components used inside the template
import '../components/editor.js';

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
	}

})
