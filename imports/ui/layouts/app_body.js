import { Machines } from '../../api/fsm/fsm.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { insert } from '../../api/fsm/methods.js'; // tu importe ta méthode tiens donc

import './app_body.html';

Template.App_body.onCreated(function appBodyOnCreated() {
  this.subscribe('machines.public');
  zob = Machines // ok que quelqu'un m'explique le scope de javascript 
	

});

testInsert = function(){

	insert.call({
		_message: "fu"
			}, (err, res) => {
				if (err) {
					console.log(err);
			}
		return(res);
	});
}