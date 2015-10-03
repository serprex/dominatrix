#!/bin/node
"use strict";
var vm = require("vm");
var domcore = require("./domcore");
var renderer = require("./renderer");
domcore.glinit();
var page = new renderer.Page();
page.parseLink("file:///wb.html");
setInterval(()=>{page.step()}, 100);
