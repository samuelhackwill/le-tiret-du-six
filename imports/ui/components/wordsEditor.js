import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './wordsEditor.html';
import './wordsEditor.css';

Template.wordsEditor.onCreated(function(){
	this.editing = new ReactiveVar(false);
})

Template.wordsEditor.onRendered(function(){

})

Template.wordsEditor.events({
	'click .wordsEditorContainer'(e){
		if(Template.instance().editing.get() == false) {

			e.stopPropagation()

			Template.instance().editing.set( true )

			let templateInstance = Template.instance()

			//add event listener on window with namespace to remove event listener easily
			$(window).on('click.outsideTextarea', function(e){

				// check if it is not the textarea and if editing is enabled
				if(!$(e.target).hasClass('wordsTextAreaContainer') && templateInstance.editing.get() == true) {

					templateInstance.editing.set( false );

					//remove event listener on window
					$(window).off('click.outsideTextarea')

					// here you should update the db with any
					// changes. ugh! or flash db and insert anew
					if (document.getElementsByClassName("wordsTextAreaContainer")[0].value) {
						textAreaValue = document.getElementsByClassName("wordsTextAreaContainer")[0].value
						parseWordsAndSendToDb(textAreaValue)
						console.log("PARSE")
					}else{
						console.log("textArea empty.")
					}
				}
			});
		}
	},
})

Template.wordsEditor.helpers({
	editMode(){
	    return Template.instance().editing.get();
	}

})

parseWordsAndSendToDb = function(obj){
	// temp array we're going to fill up then send to the db
	_data = []

	// remove previous collection
	Meteor.call("destroyWords", environment)

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
	// > blablablablbalabalbalbalbabl\n
	// > "pierre qui roule n'amasse pas mousse"
	// > Alphonse Daudais"

	// now let's make a bidimentionnal array, so that
	// we separate lines of text in order
	// to make them ready to insert them as objects in the DB
	// (see the validation schema in
	// ../../api/story/server/story.js)
	let thirdPass = /\n{1,}/g;
	instructionsArray = []

	for (var i = 0; i < instructionBlocksArray.length; i++) {
		instructionsArray.push(instructionBlocksArray[i].split(thirdPass))
		// now we should have
		// instructionsArray[0]
	// > [0] : salut
	// > [1] : blablablablbalabalbalbalbabl
	// > [2] : "pierre qui roule n'amasse pas mousse"
	// > [3] : Alphonse Daudais
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
		// the "name", then "text", then "citation", then "author".
		insertObj = {}
		insertObj.name = tempArray.shift()
		insertObj.text = tempArray.shift()
		insertObj.citation = tempArray.shift()
		insertObj.author = tempArray.shift()
		insertObj.harvestedLetters = []

		_data.push(insertObj)
		// push in _data array. When complete, call method.
	}

	console.log("push data!", _data)
	wordsInsert(_data)

}

wordsInsert = async function(obj){
	try{
		// meteor async call
		handle = await Meteor.callPromise('wordsLineInsert', obj, environment)
	}catch (error){
		console.log(error)
	}
}
