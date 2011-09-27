#!/usr/bin/env apollo
var puts = require("sys").puts;

puts(require("obligate:hello.sjs").greet("world") + "\n");
