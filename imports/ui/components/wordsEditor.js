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
						// call parser (../layouts/storystoryEditor.js)
						// parseAndSendToDb(textAreaValue)
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