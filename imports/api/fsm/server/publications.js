import { Meteor } from 'meteor/meteor';
import { Machines } from '../fsm.js';

Meteor.publish('machines.public', function machinesPublic() {
  return Machines.find({});
});
