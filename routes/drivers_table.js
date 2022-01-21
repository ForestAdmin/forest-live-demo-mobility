const express = require('express');
const { PermissionMiddlewareCreator, RecordsGetter } = require('forest-express-sequelize');
const { drivers } = require('../models');
const faker = require('faker');
faker.locale = "fr";

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('drivers');

// This file contains the logic of every route in Forest Admin for the collection drivers:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Driver
router.post('/drivers', permissionMiddlewareCreator.create(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
  next();
});

// Update a Driver
router.put('/drivers/:recordId', permissionMiddlewareCreator.update(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
  next();
});

// Delete a Driver
router.delete('/drivers/:recordId', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
  next();
});

// Get a list of Drivers
router.get('/drivers', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
  next();
});

// Get a number of Drivers
router.get('/drivers/count', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
  next();
});

// Get a Driver
router.get('/drivers/\\b(?!count\\b):recordId', permissionMiddlewareCreator.details(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
  next();
});

// Export a list of Drivers
router.get('/drivers.csv', permissionMiddlewareCreator.export(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
  next();
});

// Delete a list of Drivers
router.delete('/drivers', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
  next();
});


//Add drivers fake data
router.post('/actions/add-fake-drivers', permissionMiddlewareCreator.smartAction(),
  (req, res) => {
    for (i=0; i<5; i++) {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const emailDomains = ["gmail.com", "yahoo.fr", "example.com", "hotmail.com"];
      const randomEmailDomain= emailDomains[Math.floor(Math.random() * emailDomains.length)];
      const onBoardingStatus = ["signed up", "under review", "rejected", "accepted", "live"];
      const bookingStatus = ["available", "booked", "out of service"]
      const carModel = faker.vehicle.vehicle()

      const minLat = 48.81558
      const maxLat = 48.90216
      const minLng = 2.22412
      const maxLng = 2.46976

      let randomLat = Math.random() * (maxLat - minLat) + minLat
      let randomLng = Math.random() * (maxLng - minLng) + minLng

      drivers
        .create({
          firstName: firstName,
          lastName: lastName,
          phone: faker.phone.phoneNumber(),
          email: faker.internet.email(firstName.toLowerCase(), lastName.toLowerCase(), randomEmailDomain),
          carModel: carModel,
          location: [randomLat, randomLng],
          onboardingStatus: faker.helpers.shuffle(onBoardingStatus)[0],
          bookingStatus: faker.helpers.shuffle(bookingStatus)[0],
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

//Contact a driver
router.post('/actions/contact-driver', permissionMiddlewareCreator.smartAction(),
  (req, res) => {
          res.send({
            success: 'Your message has been sent to the driver',
          });    
});

//Mark out of service
router.post('/actions/mark-out-of-service', permissionMiddlewareCreator.smartAction(),
  (req, res) => {
    const recordsGetter = new RecordsGetter(drivers, req.user, req.query);
  
    return recordsGetter.getIdsFromRequest(req)
      .then(driversIds => drivers.update({ bookingStatus: 'out of service'}, { where: { id: driversIds }}))
      .then((length) => length[0] > 1 ? res.send({ success: 'Drivers are marked as out of service!' }) : res.send({ success: 'Driver is marked as out of service!' }) );
});

//Update coordinates
router.post('/actions/update-coordinates', permissionMiddlewareCreator.smartAction(),
  (req, res) => {
    const recordsGetter = new RecordsGetter(drivers, req.user, req.query);

    const minLat = 48.81558
    const maxLat = 48.90216
    const minLng = 2.22412
    const maxLng = 2.46976

    return recordsGetter.getIdsFromRequest(req)
    .then(driversIds => driversIds.forEach(async (driverId) => {
        let randomLat = Math.random() * (maxLat - minLat) + minLat
        let randomLng = Math.random() * (maxLng - minLng) + minLng
  
        await drivers.update({location: [randomLat, randomLng]}, { where: { id: driverId } })
    })).then(res.send({ success: 'Updated!' }));
});


module.exports = router;
