const express = require('express');
const router = express.Router();
const googleRouter = require('./google');
const rubeRouter = require('./rube');

// Mount connector routes
router.use('/google', googleRouter);
router.use('/rube', rubeRouter);

module.exports = router;
