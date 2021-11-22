import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './achievementsControl.html';
import './achievementsControl.css';


Template.achievementsControl.events({

	"click button"(t){
		console.log(t)
	},
})

Template.achievementsControl.helpers({

})