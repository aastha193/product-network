/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
var log4js = require('log4js');
var logger = log4js.getLogger('Router');
var express = require('express');
const fs = require('fs');
const path = require('path');
var https = require('https');
var app = express();

logger.level = 'debug';
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

const port = 8080;
const handlers = require('./services.js');
const userhandlers = require('./userServices.js');
/////////////////////////////////////////////////////////////////////////////
////////////////////////////// START SERVER /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
var server = https.createServer(app).listen(port, function () { });
logger.info('****************** SERVER STARTED ************************');
server.timeout = 240000;

///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST ENDPOINTS START HERE ///////////////////////////
///////////////////////////////////////////////////////////////////////////////



// Product handlers
app.post('/product', (req,res) => handlers.addProduct (req, res) );
app.get('/product/:id', (req,res) => handlers.getProduct (req, res) );
app.post('/user', (req,res) => userhandlers.enrollUser (req, res));
