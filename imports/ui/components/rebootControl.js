import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './rebootControl.html';
import './rebootControl.css';

Template.rebootControl.events({

	'click .reboot'(){
		Meteor.call("rebootCall", environment)
	}	

})