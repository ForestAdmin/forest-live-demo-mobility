const express = require('express');
const { PermissionMiddlewareCreator } = require('forest-express-sequelize');
const { customers } = require('../models');
const faker = require('faker');
faker.locale = "fr";

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('customers');

// This file contains the logic of every route in Forest Admin for the collection customers:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Customer
router.post('/customers', permissionMiddlewareCreator.create(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
  next();
});

// Update a Customer
router.put('/customers/:recordId', permissionMiddlewareCreator.update(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
  next();
});

// Delete a Customer
router.delete('/customers/:recordId', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
  next();
});

// Get a list of Customers
router.get('/customers', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
  next();
});

// Get a number of Customers
router.get('/customers/count', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
  next();
});

// Get a Customer
router.get('/customers/\\b(?!count\\b):recordId', permissionMiddlewareCreator.details(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
  next();
});

// Export a list of Customers
router.get('/customers.csv', permissionMiddlewareCreator.export(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
  next();
});

// Delete a list of Customers
router.delete('/customers', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
  next();
});

//Add customers fake data
router.post('/actions/add-fake-customers', permissionMiddlewareCreator.smartAction(),
  (req, res) => {
    for (let i = 0; i < 10; i++) {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const emailDomains = ["gmail.com", "yahoo.fr", "example.com", "hotmail.com"]
      const randomEmailDomain= emailDomains[Math.floor(Math.random() * emailDomains.length)];

      customers
        .create({
          firstName: firstName,
          lastName: lastName,
          phone: faker.phone.phoneNumber(),
          email: faker.internet.email(firstName.toLowerCase(), lastName.toLowerCase(), randomEmailDomain),
          dateOfBirth: faker.date.between('1942-01-01', '2004-01-01'),
          location: [faker.address.latitude(), faker.address.longitude()]
        })
        .then(() => {
        // the code below automatically refresh the related data 
        // 'emitted_transactions' on the Companies' Summary View 
        // after submitting the Smart action form.	
          res.send({
            success: 'New customers created',
          });
        });
    }  
});

module.exports = router;
