import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './bookmarksLibrary.html';
import './bookmarksLibrary.css';

Template.bookmarksLibrary.helpers({
	isItABookmark:function(obj){
		if (Object.keys(obj)[0]=="#bookmark") {
			return true
		}else{
			return false
		}
	}

})