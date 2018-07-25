/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("gpii-pouchdb");
fluid.require("%relationship-sketch");
//require("../../index");

fluid.setLogging(true);

gpii.pouch.harness({
    port: 6789,
    pouchConfig: {
        databases: {
            sample: {
                data: [
                    "%relationship-sketch/tests/data/associations.json",
                    "%relationship-sketch/tests/data/safes.json",
                    "%relationship-sketch/tests/data/tokens.json",
                    "%relationship-sketch/tests/data/users.json",
                    "%relationship-sketch/tests/data/views.json"
                ]
            }
        }
    },
    distributeOptions: [
        {
            source: "{that}.options.pouchConfig",
            target: "{that gpii.pouch.express}.options"
        }
    ],
    listeners: {
        "onCreate.log": {
            funcName: "fluid.log",
            args: ["baseDir:", "{that}.express.expressPouch.options.baseDir"]
        }
    }
});
