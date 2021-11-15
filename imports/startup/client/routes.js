import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../../ui/layouts/app_body.js';
import '../../ui/layouts/editor.js';
import '../../ui/layouts/admin.js';
import '../../ui/layouts/show.js';

const defaultToProd = function(context){
  // we're running this hook to make the
  // root URL default to the "Prod" environment.
  if (context.params=={}) {
    return
  }else{
    context.params={environment:"Prod"}
  }
}

FlowRouter.route('/', {
  name: 'root',
  // call hook to generate the appropriate
  // params without input from the user.
  triggersEnter: [defaultToProd],
  action(params) {
    BlazeLayout.render('show');
  },
});

FlowRouter.route('/show/:environment', {
  // this is a route to manually access
  // the show with the "Dev" or "Prod"
  // environment.
  name: 'show',
  action(params, queryParams) {
    BlazeLayout.render('show');
  },
});

FlowRouter.route('/admin/:environment', {
  // this is the route for controlling
  // the show, by the admin. Should add
  // some layer of security at some point.
  name: 'admin',
  action(params, queryParams) {
    BlazeLayout.render('admin');
  },
});

FlowRouter.route('/editor/:environment', {
  // this is the route for editing
  // the show's text & content.
	name: 'editor',
	action(params, queryParams){
		BlazeLayout.render('editor')
	}
})