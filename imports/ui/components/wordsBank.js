import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './wordsBank.html';
import './wordsBank.css';


Template.wordsBank.onCreated(function(){

});


Template.wordsBank.helpers({

});



Template.wordsBank.events({

	'click .toggleWordsBank'(){
		$('.wordsBankContainer').toggleClass('is-open');
		$('.toggleWordsBank').toggleClass('is-open');
	},

	'click .closeWordsBank'(){
		$('.wordsBankContainer').removeClass('is-open');
		$('.toggleWordsBank').removeClass('is-open');
	}

})
