const { collection } = require('forest-express-sequelize');
const { drivers } = require('../models');

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments
collection('drivers', {
  actions: [
  {
    name: 'Add fake drivers',
    type: 'global' 
  },
  {
    name: 'Contact driver',
    type: 'single',
    fields: [{
      field: "Phone",
      type: "String",
    },
    {
      field: "Message",
      type: "String",
      widget: 'text area',
    }],
    hooks: {
      load: async ({ fields, request }) => {
        const phone = fields.find(field => field.field === 'Phone');

        const id = request.body.data.attributes.ids[0];
        const driver = await drivers.findByPk(id);
        phone.value = driver.phone
  
        return fields
      }
    }
  },
  {
    name: 'Mark out of service',
    type: 'bulk',
    fields: [{
      field: 'Note',
      description: "Reason for being out of service",
      type: 'String',
      widget: 'text area',
      isRequired: true
    }]
  }
],
  fields: [
    {
      field: 'full name',
      type: 'String',
      get: (driver) => {
        return driver.firstName + ' ' + driver.lastName;
      }
    },
    {
      field: 'lat',
      type: 'String',
      get: (driver) => {
        return driver.location[0]
      }
    },
    {
      field: 'lng',
      type: 'String',
      get: (driver) => {
        return driver.location[1]
      }
    },
  ],
  segments: [],
  
});
