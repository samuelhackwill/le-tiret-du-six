import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './reader.html';
import './reader.css';


Template.reader.onCreated(function(){
	// this makes the instance accessible globally.
	// (because i'm not going to use helpers to display
	// text this time.)
	instance = this
	// i guess it would be better to pull this number
	// from DB to avoid fatal disconnections
	instance.data.obj._atIndex = -1

	// i'm getting the handle via the data which was passed
	// by the layout's helper, rather than re-subscribing to the data 
	// in the component.
	globalsHandle = instance.data.obj.globals.collection.find({});
	globalsHandle.observe({
		// if anything changes in that object, run the following
		changed:function(newDocument){
			whoHasControl = newDocument.spacebar.control
			console.log(newDocument.spacebar.adminAtIndex)
			_adminAtIndex = newDocument.spacebar.adminAtIndex
			_localIndex = instance.data.obj._atIndex
			if (whoHasControl=="admin" && _localIndex != _adminAtIndex) {
				console.log("GO!")
				adminNext(_adminAtIndex);
			}else{
				return
			}
		}
	})
})

Template.reader.onRendered(function(){
	document.onkeyup = function(event){
		if (event.keyCode==32) {
			spaceBarPress()
		}
	}
})

spaceBarPress = function(){
	let _atIndex = instance.data.obj._atIndex
	let _Story = instance.data.obj.story.collection.find({}).fetch()

	if (_atIndex < _Story.length){
		instance.data.obj._atIndex = _atIndex +1
		loadText(_Story, instance.data.obj._atIndex)
	}else{
		console.log("No more text!")
		return
	}

}

loadText = function(_Story, index){
	console.log(_Story[index])
}

adminNext = function(_adminAtIndex){
	let _Story = instance.data.obj.story.collection.find({}).fetch()
	loadText(_Story, _adminAtIndex)
	console.log("admin next, biatch")
	// instance.data.obj.globals.collection.find({}).fetch()[0].spacebar.control
}