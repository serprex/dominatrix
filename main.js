#!/bin/node
'use strict';
var domcore = require('./domcore');
domcore.glinit();
var driver = require('./driver');
var page = new driver.Page();
var fs = require('fs');
page.loadpage(fs.readFileSync(process.argv[2] || "wb.html", 'utf8'), 'file:///'+process.argv[2]);
setInterval(() => page.render(), 33);
if (typeof exports !== 'undefined') exports.page = page;
