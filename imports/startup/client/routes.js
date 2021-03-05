import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../../ui/layouts/app_body.js';
import '../../ui/layouts/storyEditor.js';
import '../../ui/layouts/admin.js';
import '../../ui/layouts/show.js';


FlowRouter.route('/', {
  name: 'show',
  action() {
    BlazeLayout.render('show');
  },
});

FlowRouter.route('/admin/:environment', {
  name: 'admin',
  action(params, queryParams) {
    BlazeLayout.render('admin');
  },
});

FlowRouter.route('/editor/:environment', {
	name: 'storyEditor',
	action(params, queryParams){
		BlazeLayout.render('storyEditor')
	}
})