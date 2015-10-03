#!/bin/node
"use strict";
var vm = require("vm");
var domcore = require("./domcore");
var renderer = require("./renderer");
domcore.glinit();
var page = new renderer.Page(800, 600);
page.parseLink("file:///wb.html");
setInterval(()=>{page.step()}, 100);
