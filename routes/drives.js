const express = require('express');
const { PermissionMiddlewareCreator } = require('forest-express-sequelize');
const { drives, drivers, customers } = require('../models');
const Sequelize = require('sequelize')
const faker = require('faker');
faker.locale = "fr";


const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('drives');

// This file contains the logic of every route in Forest Admin for the collection drives:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Drive
router.post('/drives', permissionMiddlewareCreator.create(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
  next();
});

// Update a Drive
router.put('/drives/:recordId', permissionMiddlewareCreator.update(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
  next();
});

// Delete a Drive
router.delete('/drives/:recordId', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
  next();
});

// Get a list of Drives
router.get('/drives', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
  next();
});

// Get a number of Drives
router.get('/drives/count', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
  next();
});

// Get a Drive
router.get('/drives/\\b(?!count\\b):recordId', permissionMiddlewareCreator.details(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
  next();
});

// Export a list of Drives
router.get('/drives.csv', permissionMiddlewareCreator.export(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
  next();
});

// Delete a list of Drives
router.delete('/drives', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
  next();
});

//Add drives fake data

async function getRandomInstance (model) {
  let record = await model.findAll();
  console.log(record);
  record = faker.helpers.shuffle(record)[0];
  console.log(record);
  return record 
}
router.post('/actions/add-fake-drives', permissionMiddlewareCreator.smartAction(),
 async (req, res) => {
    for (i=0; i<5; i++) {
      // try {
      //   const randomCustomer = await customers.findAll({order: Sequelize.literal('random()'), limit:1})
      //   return randomCustomer
      // } catch(e) {
      //   alert(e);
      // }

      // try {
      //   const randomDriver = await drivers.findAll({order: Sequelize.literal('random()'), limit:1})
      //   return randomDriver
      // } catch(e) {
      //   alert(e);
      // }
      const randomCustomer = await getRandomInstance(customers);
      const randomDriver = await getRandomInstance(drivers);
      console.log(randomCustomer.id);
      console.log(randomDriver.id);
      // console.log(customers.findAll());
      // console.log(drivers.findAll());
      // customers.findOne().then((record)=>{
      //   const randomCustomer = record
      //   console.log("customer", randomCustomer)
      // });
      // const randomDriver =  await drivers.findOne();
      
      
  
      let driveStatus = ["live", "cancelled", "terminated"]
      driveStatus = faker.helpers.shuffle(driveStatus)[0]
      const startAt = new Date(faker.date.recent());
      const terminatedAt = driveStatus === "live" ? "" : new Date(startAt.getTime() + Math.random() * 60 * 60000)

      drives
        .create({
          driverIdKey: randomDriver.id,
          customerIdKey: randomCustomer.id,
          status: driveStatus,
          startedAt: startAt,
          terminatedAt: terminatedAt,
          km: (Math.random() * 60).toFixed(2),
          surcharge: faker.helpers.shuffle([Math.floor(Math.random())*100, 0])[0]
        })
        .then(() => {
        // the code below automatically refresh the related data 
        // 'emitted_transactions' on the Companies' Summary View 
        // after submitting the Smart action form.	
          res.send({
            success: 'New drivers created',
          });
        });
    }
});

//Change driver

router.post('/actions/change-driver', permissionMiddlewareCreator.smartAction(),
  (req, res) => {
    let driver = req.body.data.attributes.values['Driver'];
    const array = driver.split('-');
    const driverId = parseInt(array[array.length - 1]);

    const driveId = req.body.data.attributes.ids[0];
    
    return drives.update({ driverIdKey: driverId }, { where: { id: driveId } }).then(() => res.send({success: 'Driver updated successfully!'}))
    
});

module.exports = router;
