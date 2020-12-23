import { Machines } from './fsm.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


export const insert = new ValidatedMethod({
  name: 'machines.insert',
  validate: new SimpleSchema({
    _message: {
      type: String,
    },
  }).validator(),
  run({ _message }) {
  	console.log(_message)
    return Machines.insert({message: _message});
  },
});