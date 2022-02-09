const { collection } = require('forest-express-sequelize');
const { drives, customers, drivers, issues } = require('../models');

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments
collection('issues', {
  actions: [{
    name: "Add fake issues",
    type: 'global',
  },
  {
    name: "Assign to another manager",
    type: "bulk",
    fields: [{
      field: "Manager",
      description: "Choose another manager",
      type: "Enum",
      enums: ["Hugues Bisson", "Lisa Beaupré", "Alain Mathieu", "Pauline Fontaine"],
  }]
  },
  {
    name: "Change status",
    type: "bulk",
    fields: [{
      field: "Status",
      description: "Choose from the following status",
      type: "Enum",
      enums: ["to review", "resolved", "under review"],
  }]
  },
  {
    name: "Contact the driver",
    type: "single",
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
        const phone = fields.find(field => field.field === "Phone");

        const id = request.body.data.attributes.ids[0];
   
        const issue = await issues.findByPk(id);
        const drive = await drives.findByPk(issue.driveIdKey);
        const driver = await drivers.findByPk(drive.driverIdKey);
        phone.value = driver.phone
  
        return fields
      }
    }
  },
  {
    name: "Block driver",
    type: "single"
  },
  {
    name: "Give a discount",
    type: "single",
    fields: [{
      field: "Amount",
      description: "Give an amount in value for a voucher"
    },
    {
      field: "Percentage",
      description: "Give a discount % on the next trip"
    }
  ]
  },{
    name: "Process a refund",
    type: "single"
  }
  ],
  fields: [{
    field: 'customer',
    type: 'String',
    get: async (issue) => {
      const drive = await drives.findByPk(issue.driveIdKey)
      const customer = await customers.findByPk(drive.customerIdKey)
      return `<h5><strong>${customer.firstName + ' ' + customer.lastName}</strong></h5>
              <h6>☎️ &nbsp; ${' ' + customer.phone}<h6>
              <h6>📩 &nbsp; ${' ' + customer.email}<h6>`
    }
    },
    {
    field: 'driver',
    type: 'String',
    get: async (issue) => {
      const drive = await drives.findByPk(issue.driveIdKey)
      const driver = await drivers.findByPk(drive.driverIdKey)
      return `<h5><strong>${driver.firstName + ' ' + driver.lastName}</strong></h5>
              <img src="${driver.profilePicture}" width="150">
              <h6>☎️ &nbsp; ${' ' + driver.phone}<h6>
              <h6>📩 &nbsp; ${' ' + driver.email}<h6>`
    }
    },
    {
      field: 'location',
      type: 'String',
      get: async (issue) => {
        const drive = await drives.findByPk(issue.driveIdKey);
        const driver = await drivers.findByPk(drive.driverIdKey);
        const driveLocation = driver.location;
        return `${driveLocation[0]},${driveLocation[1]}`
      }
    },
    {
      field: 'resolution time',
      type: 'String',
      get: (issue) => {
        if (!!issue.resolvedAt) {
          return (Math.abs(issue.resolvedAt - issue.underreviewAt)/(1000 * 60 * 60)).toFixed(2) + ' hours'
        }
        // const resolutionTime = !!issue.resolvedAt ? (Math.abs(issue.resolvedAt - issue.underreviewAt)/(1000 * 60 * 60)).toFixed(2) : 0 ;
        // return resolutionTime + ' hours';
      }
    }
  ],
  segments: [],
  
});
