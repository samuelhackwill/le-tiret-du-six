import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../../ui/layouts/app_body.js';
import '../../ui/layouts/storyEditor.js';


// FlowRouter.route('/', {
//   name: 'App.home',
//   action() {
//     BlazeLayout.render('App_body');
//   },
// });

FlowRouter.route('/editor/:environment', {
	name: 'storyEditor',
	action(params, queryParams){
		BlazeLayout.render('storyEditor')
	}
})