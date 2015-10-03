#!/bin/node
"use strict";
var vm = require("vm");
var domcore = require("./domcore");
var renderer = require("./renderer");
domcore.glinit();
var page = new renderer.Page(800, 600);
if (typeof exports !== 'undefined') exports.page = page;
page.parseLink('file:///'+(process.argv[2] || 'wb.html')).then(() => setInterval(() => {page.render()}, 33));
