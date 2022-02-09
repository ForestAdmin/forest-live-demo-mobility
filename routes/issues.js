const express = require('express');
const { PermissionMiddlewareCreator, RecordsGetter } = require('forest-express-sequelize');
const { issues, drives, drivers } = require('../models');
const faker = require('faker');
faker.locale = "fr";

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('issues');

// This file contains the logic of every route in Forest Admin for the collection issues:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Issue
router.post('/issues', permissionMiddlewareCreator.create(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
  next();
});

// Update a Issue
router.put('/issues/:recordId', permissionMiddlewareCreator.update(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
  next();
});

// Delete a Issue
router.delete('/issues/:recordId', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
  next();
});

// Get a list of Issues
router.get('/issues', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
  next();
});

// Get a number of Issues
router.get('/issues/count', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
  next();
});

// Get a Issue
router.get('/issues/\\b(?!count\\b):recordId', permissionMiddlewareCreator.details(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
  next();
});

// Export a list of Issues
router.get('/issues.csv', permissionMiddlewareCreator.export(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
  next();
});

// Delete a list of Issues
router.delete('/issues', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
  next();
});

//Add fake issues
async function getRandomInstance (model) {
  const records = await model.findAll();
  const record = faker.helpers.shuffle(records)[0];
  return record 
}

router.post('/actions/add-fake-issues', permissionMiddlewareCreator.smartAction(),
 async (req, res) => {
    for (i=0; i<6; i++) {

      const randomDrive = await getRandomInstance(drives);

      let issueStatus = ["to review", "resolved", "under review"];
      issueStatus = faker.helpers.shuffle(issueStatus)[0];
      console.log(issueStatus);
      const categories = ["safety", "lost item", "pricing and payment", "account"];
      const category = faker.helpers.shuffle(categories)[0];
      let priority = ["high", "low", "medium"];
      priority = faker.helpers.shuffle(priority)[0];
      let manager = ["Hugues Bisson", "Lisa Beaupré", "Alain Mathieu", "Pauline Fontaine"];
      manager = faker.helpers.shuffle(manager)[0];
      const rating = faker.helpers.shuffle([...Array(5).keys()])[0];
      const underreviewAt = issueStatus === "to review" ? null : new Date(faker.date.recent())
      const resolvedAt = issueStatus === "resolved" ? new Date(underreviewAt.getTime() + Math.random() * 240 * 60000) : null

      issues
        .create({
          driveIdKey: randomDrive.id,
          manager: manager,
          status: issueStatus,
          priority: priority,
          category: category,
          rating: rating,
          underreviewAt: underreviewAt,
          resolvedAt: resolvedAt,
        })
        .then(() => {
        // the code below automatically refresh the related data 
        // 'emitted_transactions' on the Companies' Summary View 
        // after submitting the Smart action form.	
          res.send({
            success: 'New issues created',
          });
       });
    }
});

//Assign to another manager

router.post('/actions/assign-to-another-manager', permissionMiddlewareCreator.smartAction(),
  (req, res) => {
    const recordsGetter = new RecordsGetter(issues, req.user, req.query);
    const manager = req.body.data.attributes.values['Manager'];
    
    return recordsGetter.getIdsFromRequest(req)
    .then(issuesIds => issues.update({ manager: manager }, { where: { id: issuesIds }}))
    .then((length) => length[0] > 1 ? res.send({ success: `Issues have been successfully assigned to ${manager}!` }) : res.send({ success: `Issue has been successfully assigned to ${manager}!` }) );  
    
});

//Change status

router.post('/actions/change-status', permissionMiddlewareCreator.smartAction(),
  (req, res) => {
    const recordsGetter = new RecordsGetter(issues, req.user, req.query);
    const status = req.body.data.attributes.values['Status'];
    
    return recordsGetter.getIdsFromRequest(req)
    .then((issuesIds) => { 
      if (status === "under review") {
        issues.update({status: status, underreviewAt: Date.now() }, { where: { id: issuesIds } })
      } else if (status === "resolved") {
        issues.update({status: status, resolvedAt: Date.now() }, { where: { id: issuesIds } }) 
      } else {
        issues.update({ status: status }, { where: { id: issuesIds } }) 
      }
    })
    .then(() => res.send({ success: "Status has been successfully changed" }));  
    
});

//Contact the driver
router.post('/actions/contact-the-driver', permissionMiddlewareCreator.smartAction(),
  (req, res) => {
    res.send({
      success: 'Your message has been sent to the driver',
    });    
});


//Block driver
router.post('/actions/block-driver', permissionMiddlewareCreator.smartAction(),
  async (req, res) => {
    const id =  req.body.data.attributes.ids[0];
    const issue = await issues.findByPk(id);
    const drive = await drives.findByPk(issue.driveIdKey);
    const driver = await drivers.findByPk(drive.driverIdKey);

    return driver.update({bookingStatus: "out of service"}, { where: {id : driver.id } })
    .then(()=> res.send({ success: `The driver ${driver.firstName} ${driver.lastName} has been blocked` })) 
  });

//Give a discount
router.post('/actions/give-a-discount', permissionMiddlewareCreator.smartAction(),
  (req, res) => {
    res.send({
      success: 'The customer was successfully offered a discount for the next trip'
    });    
});


//Process a refund
router.post('/actions/process-a-refund', permissionMiddlewareCreator.smartAction(),
  (req, res) => {
    res.send({
      success: 'The customer has been refunded for this trip'
    });    
});

module.exports = router;
