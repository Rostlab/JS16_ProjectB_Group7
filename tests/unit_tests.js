var expect = require('expect.js');
var gotplod = require('../npm.js');
var fs = require('fs');
var path = require('path');

describe("gotarffplod unit tests", function () {
    describe("predictions testing", function () {
        it("should return predictions for all characters", function () {
            var json_char = fs.readFileSync(path.resolve(__dirname, '../prediction.json'), 'utf8');
            var array_char = JSON.parse(json_char);
            var total = array_char.length;
            console.log("Total number of characters: ", total);
            var plod_exists = 0;
            array_char.forEach(function (char) {
                if (char.hasOwnProperty("plod")) {
                    plod_exists++;
                }
            });
            console.log("Plod exists for : " + plod_exists + " characters");
            expect(plod_exists).to.be(total);
        });
        it("should return predictions for top characters", function () {
            var json_char = fs.readFileSync(path.resolve(__dirname, '../top.json'), 'utf8');
            var array_char = JSON.parse(json_char);
            var total = array_char.length;
            console.log("Total number of characters: ", total);
            var plod_exists = 0;
            array_char.forEach(function (char) {
                if (char.hasOwnProperty("plod")) {
                    plod_exists++;
                }
            });
            console.log("Plod exists for : " + plod_exists + " characters");
            expect(plod_exists).to.be(total);
        });
    });
});