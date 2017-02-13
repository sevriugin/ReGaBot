"use strict";

function testHook(context, req) {
    
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: "Hello " + (req.query.name || req.body.name)
    };
    
    context.done();
}

module.exports = { default: testHook }
