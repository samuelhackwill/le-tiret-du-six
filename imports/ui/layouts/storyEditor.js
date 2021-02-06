import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';

import './storyEditor.html';
import './storyEditor.css';

// components used inside the template
import '../components/lineComponent.js';

Template.storyEditor.onCreated(function storyEditorOnCreated() {
	// environment can either be "prod" or "dev"
	environment = FlowRouter.getParam("environment")
	// either subscribe to dev or prod DB, defaults to dev in case
	// of erroneous query.
	if (environment!="dev" && environment!="prod") {
		environment="dev"
	}
	this.subscribe(`story.${environment}`);
});

Template.storyEditor.events({

	'click #🗑'(){
		Meteor.call("destroyStory", environment)
	}
})

Template.storyEditor.helpers({

	// for the title of the page
	env(){
		return environment
	},


	// this returns the story from the db
	story(){

		if (!Template.instance().subscriptionsReady()) {
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
	},

	paramsKey(){
		const paramsKey = yo
		return paramsKey
	}

})

parseAndSendToDb = function(obj){

	console.log("obj length", obj.length)
	//i estimate that the app can insert 2600 chars/s
	// although the inserting time has certainly more to do
	// with the number of calls to the db.

	animationFade = 500
	estimatedTimeToCompletion = obj.length/2.6
	document.getElementsByClassName("lineComponentBody")[0].style.opacity = 0.2;

	// we want to start editing after the fadeout
	setTimeout(function(){
			
		Meteor.call("destroyStory", environment)

		// the first thing to do is to clear excessive carriage returns 
		// as we're going to use the double carriage return as a delimiter 
		// between instruction blocks.
		let firstPass = /\n{3,}/g;
		// we want to replace all triple returns+ with double returns.
		filteredObj = obj.replaceAll(firstPass, "\n\n")

		// ok now let's populate an array using double returns as a delimiter
		// between distinct instruction blocks.
		let secondPass = /\n{2,}/g;
		instructionBlocksArray = filteredObj.split(secondPass)
		// now we should have 
		// instructionBlocksArray[0]
		// > "salut\n
		// > // INSERT 1"

		// now let's make a bidimentionnal array, so that
		// we separate to-be "lines" and to-be "params" before insertion
		// in the database (see the validation schema in 
		// ../../api/story/server/story.js)
		let thirdPass = /\n{1,}/g;
		instructionsArray = []

		for (var i = 0; i < instructionBlocksArray.length; i++) {
			instructionsArray.push(instructionBlocksArray[i].split(thirdPass))
			// now we should have 
			// instructionsArray[0]
			// > [0]: salut
			// > [1]: // INSERT 1
		}

		//now let's insert everything in the DB!
		for (var o = 0; o < instructionsArray.length; o++) {
			// create temporary array to hold the block of instructions
			// before we regex the shit out of it
			tempArray = []
			for (var p = 0; p < instructionsArray[o].length; p++){
				// populate the array with the instructions
				if(instructionsArray[o][p]){
					tempArray.push(instructionsArray[o][p])
				}else{
					console.log("trailing empty line!!")
				}
			}
			// the first item of the array is always going to be
			// the "line". C'est comme ça
			insertObj = {}
			insertObj.params = []
			insertObj.line = tempArray.shift()

			// then we need to push the params, which are 
			// the remaining items of the tempArray.
			for(var q = 0; q < tempArray.length; q++){
				// first remove leading whitespace (tabs)
				let paramsFiltered = tempArray[q].replace(/^\s/, "")

				// then run this diabolical regex which evaluates 
				// three different scenarios : a param can be a comment
				// 		// comment
				// or a simple instruction
				// 		#stop
				// or a complex instruction
				// 		#bookmark textBegining
				let paramsArray = paramsFiltered.match(/([/]{2})\s(.+)|([#]\S+)\s(.+)|([#].+)/)

				if(paramsArray){
					// shortcut evaluations to define key & value.
					let key = paramsArray[5] || paramsArray[3] || paramsArray[1] 
					let value = paramsArray[4] || paramsArray[2] || null

					param = {[key]:value}
					insertObj.params.push(param)
				}else{
					console.log("params Array is empty.")
				}

			}
			storyInsert(insertObj, environment)
		}
		setTimeout(function(){
			document.getElementsByClassName("lineComponentBody")[0].style.opacity = 1;
		},estimatedTimeToCompletion)
	},animationFade)

}

storyInsert = async function(obj, env){
	try{
		// get current environment : prod or dev
		env = FlowRouter._current.params.environment
		// meteor async call
		await Meteor.callPromise('storyLineInsert', obj)
	}catch (error){
		console.log(error)
	}
}