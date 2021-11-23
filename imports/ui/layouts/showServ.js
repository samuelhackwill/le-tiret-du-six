import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// streamer is for fast paced interactivity
import { streamer } from '../../api/streamer/streamer.js';

import './showServ.html';
import './showServ.css';

flash = undefined

streamer.on('message', function(message) {
	// only run if from show layout. Didn't find another way of doing it
	// as streamer seems to be a global object and runs everywhere.
	if(FlowRouter.getRouteName() == "showServ" && message.env == environment){
		switch (message.action){
			case "adminShowServ":
			onOff = false
			console.log("showServ admin")
			blink = setInterval(function(){
				if (onOff) {
					document.getElementsByClassName("flash")[0].style.backgroundColor = "red"
				}else{
					document.getElementsByClassName("flash")[0].style.backgroundColor = "black"
				}
				onOff =! onOff
			},333)

			break;

			case "adminHideServ":
			console.log("hideServ admin")
			window.clearInterval(blink)
			document.getElementsByClassName("flash")[0].style.backgroundColor = "black"
			break;

			case "playerShowServ":
			// killLetter(letterId, local)
			console.log("showServ player")
			if (flash) {
				window.clearInterval(flash)
			}else{

			}
			document.getElementsByClassName("flash")[0].style.backgroundColor = "red"
			flash = setTimeout(function(){
				document.getElementsByClassName("flash")[0].style.backgroundColor = "black"
			},500)			
			break;
		}
	}
});


Template.showServ.onCreated(function(){
	// environment can either be "Prod" or "Dev"
	_environment = FlowRouter.getParam("environment")
	environment = _environment.charAt(0).toUpperCase()+_environment.slice(1)
	// either subscribe to dev or prod DB, defaults to dev in case
	// of erroneous query.
	if (environment!="Dev" && environment!="Prod") {
		environment="Dev"
	}
})
