var expect = require('expect.js');
var gotplod = require('../npm.js');

describe("gotarffplod delivery tests", function() {
    it("require an object", function () {
        expect(gotplod).to.be.an('object');
    });
    it("include init function", function() {
        expect(gotplod.init).to.be.a('function');
    });
    it("inctude get functions", function() {
        expect(gotplod.getPlod).to.be.a('function');
        expect(gotplod.getTop).to.be.a('function');
        expect(gotplod.getTopPredicted).to.be.a('function');
        expect(gotplod.getAttrRank).to.be.a('function');
        expect(gotplod.getAllCharPredictions).to.be.a('function');
        expect(gotplod.getAllAttrRanks).to.be.a('function');
    });
});
