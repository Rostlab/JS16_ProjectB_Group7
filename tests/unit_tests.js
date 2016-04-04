var expect = require('expect.js');
var gotplod = require('./npm.js');

describe("gotarffplod tests", function() {
   describe("predictions testing", function() {
      it("should return predictions for all characters", function() {
          gotplod.init();
          console.log(gotplod.getAllCharPredictions());
      });
   });
});