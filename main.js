#!/bin/node
'use strict';
var domcore = require('./domcore');
domcore.glinit();
//var renderer = require('./renderer');
//var page = new renderer.Page(800, 600);
//page.parseLink('file:///'+(process.argv[2] || 'wb.html')).then(() => setInterval(() => {page.render()}, 33));
var driver = require('./driver');
var page = new driver.Page();
var fs = require('fs');
page.loadpage(fs.readFileSync(process.argv[2], 'utf8'), 'file:///'+process.argv[2]);
setInterval(() => {page.render()}, 33);
if (typeof exports !== 'undefined') exports.page = page;
