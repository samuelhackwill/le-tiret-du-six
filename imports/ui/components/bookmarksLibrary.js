import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './bookmarksLibrary.html';
import './bookmarksLibrary.css';

Template.bookmarksLibrary.helpers({
	isItABookmark:function(obj){
		// obj is the context passed from the html "this"
		// console.log(Object.values(obj)[0], Object.values(obj)[0].match(/\./g)==null)
		if (Object.keys(obj)[0]=="#bookmark") {
		// also only return one-worded bookmarks to 
		// filter most of the beach bookmarks.
			return true
		}else{
			return false
		}
	}
})

Template.bookmarksLibrary.events({
	"click .bookmarkButton"(e){
		bookmarkTargetId = e.target.id
		// get index of line from the rendered HTML.
		// might be a bit hacky
		_targetIndex = Number(document.getElementById("#bookmark."+bookmarkTargetId).parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[0].innerHTML)
		// update local admin value
		instance.data.adminAtIndex = _targetIndex
		// and sync all clients.
		Meteor.call("spacebarAdmin", environment, _targetIndex)


		// we also need to tell all clients to stop reading the words library
		// when we're resyncing. 
		if (bookmarkTargetId=="resync") {
			Meteor.call("closeAllWordsBank", environment)
		}
	}
})