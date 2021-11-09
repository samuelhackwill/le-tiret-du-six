import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './superControl.html';
import './superControl.css';

Template.superControl.events({

	'click .reboot'(){
		Meteor.call("rebootAdmin", environment)
	},

	'click .stopMining'(){
		Meteor.call("stopMiningAdmin", environment)
	}	

})