"use strict";

function testHook(req, res) {
    console.log('testHook');
}

module.exports = { default: testHook }
