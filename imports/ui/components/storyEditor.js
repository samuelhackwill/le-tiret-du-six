import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';

import './storyEditor.html';
import './storyEditor.css';

// memory for the collapse button
collapsed = false

Template.storyEditor.onCreated(function(){
	this.editing = new ReactiveVar(false);
})

Template.storyEditor.onRendered(function(){
})

Template.storyEditor.events({
	'click .storyEditorContainer'(e){
		// if you're admin, editing is forbidden.
		// that's to avoid misclicking during the show.
		if(FlowRouter.current().route.name=="admin"){
			return
		}
		if(Template.instance().editing.get() == false) {

			e.stopPropagation()

			Template.instance().editing.set( true )

			let templateInstance = Template.instance()

			//add event listener on window with namespace to remove event listener easily
			$(window).on('click.outsideTextarea', function(e){

				// check if it is not the textarea and if editing is enabled
				if(!$(e.target).hasClass('textAreaContainer') && templateInstance.editing.get() == true) {

					templateInstance.editing.set( false );

					//remove event listener on window
					$(window).off('click.outsideTextarea')

					// here you should update the db with any
					// changes. ugh! or flash db and insert anew
					if (document.getElementsByClassName("textAreaContainer")[0].value) {
						textAreaValue = document.getElementsByClassName("textAreaContainer")[0].value
						// call parser (../layouts/storystoryEditor.js)
						parseAndSendToDb(textAreaValue)
					}else{
						console.log("textArea empty.")
					}

					collapsed = false;
					document.getElementsByClassName("paramsCollapser")[0].innerHTML = "collapse params"
				}
			});
		}
	},

	'keydown .textAreaContainer'(event){
		// this is to enable indentation with TAB key in the textarea.
		element = document.getElementsByClassName("textAreaContainer")[0]
		if (event.key == 'Tab') {
		    event.preventDefault();
		    var start = element.selectionStart;
		    var end = element.selectionEnd;

		    // set textarea value to: text before caret + tab + text after caret
		    element.value = element.value.substring(0, start) + "\t" + element.value.substring(end);

		    // put caret at right position again
		    element.selectionStart = element.selectionEnd = start + 1;
	  }

	}
})

Template.storyEditor.helpers({
	editMode(){
	    return Template.instance().editing.get();
	},

	lineHasPlayers(lineIndex){
		console.log('lineHasPlayers', this.aiguebename, this.atIndex, lineIndex);
		return this.atIndex == lineIndex;
	},
})


parseAndSendToDb = function(obj){
	// temp array we're going to fill up then send to the db
	_data = []

	// remove previous collection
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
			let paramsFiltered1 = tempArray[q].replace(/^\s/, "")
			// then remove trailing whitespace
			let paramsFiltered2 = paramsFiltered1.replace(/\s{0,}$/, "")

			// then run this diabolical regex which evaluates
			// three different scenarios : a param can be a comment
			// 		// comment
			// or a simple instruction
			// 		#stop
			// or a complex instruction
			// 		#bookmark textBegining
			let paramsArray = paramsFiltered2.match(/([/]{2})\s(.+)|([#]\S+)\s(.+)|([#].+)/)

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
		_data.push(insertObj)
		// push in _data array. When complete, call method.
	}

	console.log("push data!", _data)
	storyInsert(_data)

}

storyInsert = async function(obj){
	try{
		// meteor async call
		handle = await Meteor.callPromise('storyLineInsert', obj, environment)
	}catch (error){
		console.log(error)
	}
}
