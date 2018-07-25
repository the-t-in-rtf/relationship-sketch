// TODO: Convert this to be part of gpii-pouchdb so that we have a means of getting rid of couchapp
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

var fs = require("fs");
var path = require("path");

require("../../../");

fluid.registerNamespace("gpii.relationshipSketch.viewBundler");

gpii.relationshipSketch.viewBundler.generateJson = function (that) {
    var viewContentPath = fluid.module.resolvePath(that.options.viewContentPath);

    var allViewContent = { docs: [] };

    var designDocDirs = fs.readdirSync(viewContentPath);

    fluid.each(designDocDirs, function (designDocDir) {
        var designDoc = { "_id": "_design/" + designDocDir, views: {} };
        var subPath = path.resolve(viewContentPath, designDocDir, "views");
        var viewDirs = fs.readdirSync(subPath);
        fluid.each(viewDirs, function (viewName) {
            var viewFunctionPath = path.resolve(subPath, viewName);

            var viewObject = {};
            var functionFiles = fs.readdirSync(viewFunctionPath);
            fluid.each(functionFiles, function (filename) {
                var filePath = path.resolve(viewFunctionPath, filename);
                var fnName = filename.replace(/\.js$/, "");
                var content = fs.readFileSync(filePath, "utf8");
                viewObject[fnName] = content;
            });

            designDoc.views[viewName] = viewObject;
        });
        allViewContent.docs.push(designDoc);
    });

    var outputPath = fluid.module.resolvePath(that.options.outputPath);
    fs.writeFileSync(outputPath, JSON.stringify(allViewContent, null, 2));
};

fluid.defaults("gpii.relationshipSketch.viewBundler", {
    gradeNames: ["fluid.component"],
    viewContentPath: "%relationship-sketch/tests/_design",
    outputPath: "%relationship-sketch/tests/data/views.json",
    listeners: {
        "onCreate.generateJson": {
            funcName: "gpii.relationshipSketch.viewBundler.generateJson",
            args:     ["{that}"]
        }
    }
});

gpii.relationshipSketch.viewBundler();
