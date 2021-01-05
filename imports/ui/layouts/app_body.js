import { StoryDev } from '../../api/story/story.js';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './app_body.html';

Template.App_body.onCreated(function appBodyOnCreated() {
  this.subscribe('story.dev');
});

testInsert = async function(obj){
	try{
		const result = await Meteor.callPromise('storyLineInsert', obj)
		console.log("finished ! ", result)
	}catch (error){
		console.log(error)
	}
}