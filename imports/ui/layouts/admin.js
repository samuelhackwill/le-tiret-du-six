import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Story } from '../../api/story/story.js';
import { Globals } from '../../api/globals/globals.js';
import { Players } from '../../api/players/players.js';

import { streamer } from '../../api/streamer/streamer.js';

import './admin.html';
import './admin.css';

// components used inside the template
import '../components/storyEditor.js';
import '../components/bookmarksLibrary.js';
import '../components/spacebarControl.js';
import '../components/achievementsControl.js';
import '../components/superControl.js';
import '../components/tracker.js';

streamer.on('message', function(message) {
	// only run if from admin layout. Didn't find another way of doing it
	// as streamer seems to be a global object and runs everywhere.
	if(FlowRouter.getRouteName() == "admin" && message.env == environment){
		switch (message.action){
			case "showServerCall":
			// the message.strobeSwitch will be "true" when 
			// the first player calls the strobe, and "false",
			// when the last players calls the strobe. we add
			// a little bit of delay (10 seconds) just so the last 
			// player can also see the strobe in the room.
			if (message.strobeSwitch) {
				document.getElementsByClassName("flexAdminContainer")[0].classList.add("strobe")
			}else{
				Meteor.setTimeout(function() {
					document.getElementsByClassName("flexAdminContainer")[0].classList.remove("strobe")
				}, 10000);
			}
			break;

			case "endRaceSolo":
			if (message.winner == "bot") {
				window.clearInterval(autorun)
				document.getElementsByClassName("autorun")[0].innerText = "Bot autorun"				
				Meteor.call('stepperStopCall', _env = environment)
			}
			break;

		}
	}
});

Template.admin.onCreated(function storyEditorOnCreated() {
	// environment can either be "prod" or "Dev"
	_environment = FlowRouter.getParam("environment")
	environment = _environment.charAt(0).toUpperCase()+_environment.slice(1)
	// either subscribe to dev or prod DB, defaults to dev in case
	// of erroneous query.
	if (environment!="Dev" && environment!="Prod") {
		environment="Dev"
	}

	this.subscribe('story')
	this.subscribe('globals',()=>{
		instance.data.adminAtIndex = 0
	});	
	this.subscribe('players')
	
	instance = this
});

Template.admin.onRendered(function(){
	// we need to bind the scrolling of the tracker component
	// with the scrolling of the editor component, or else
	// the lines won't be aligned with the cursors.
	elems = document.getElementsByClassName("scrollBinder");

	for (i = 0; i < elems.length; i++) {
	    elems[i].addEventListener("scroll", doubleScroll);
	}
})


Template.admin.helpers({
	story(){
		return{
			story:Story.find({env: environment})
		}
	},

	bookmarks(){
	// this returns only fields of the DB
	// with one "bookmark" param.
		return{
			bookmarks:Story.find({env:"Dev", 'data.params':{$elemMatch:{"#bookmark":{$exists:true}}} }),
			story:Story.find({env: environment})
		}
	},

	globals(name){
	// this returns one named global (passed from the HTML)
		return{
			global:Globals.find({env:environment, [name]:{$exists:true}})
		}
	},

	allData(){
	// this returns one named global (passed from the HTML)
		return{
			players:Players.find({env:environment}),
			story:Story.find({env: environment}),
			globals:Globals.find({env:environment})
		}
	},
})

// this function is called to bind the scrolling of two divs together.
doubleScroll = function() {
    var top = this.scrollTop;

    for (i = 0; i < elems.length; i++) {
        elems[i].scrollTop=top;
    }
}
