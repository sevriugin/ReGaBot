"use strict";

var express = require('express');
var app = express();

function testHook(req, res) {
    res.status(200);
    res.end();
}

module.exports = { default: testHook }
