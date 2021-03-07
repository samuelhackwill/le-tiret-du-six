import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './reader.html';
import './reader.css';

import { playerInsert } from '../../api/players/methods.js'

Template.reader.onCreated(function(){
	testing = this.data
})