import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../../ui/layouts/app_body.js';
import '../../ui/layouts/storyEditor.js';
import '../../ui/layouts/admin.js';
import '../../ui/layouts/show.js';

const defaultToProd = function(context){
  // we're running this function to make the
  // root URL default to the "Prod" environment.
  if (context.params=={}) {
    return
  }else{
    context.params={environment:"Prod"}
  }
}

FlowRouter.route('/', {
  name: 'root',
  triggersEnter: [defaultToProd],
  action(params) {
    BlazeLayout.render('show');
  },
});

FlowRouter.route('/show/:environment', {
  name: 'show',
  action(params, queryParams) {
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