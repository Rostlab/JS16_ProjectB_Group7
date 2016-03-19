var fs = require('fs');
var promise = require('promise');
var centrality = require('ngraph.centrality');
var graph = require('ngraph.graph')();
var promisedResults = [];

module.exports = getPopularityAll

function getPopularityAll (dataset, pgFolder) {
  var maxScore = 0,
    minScore = 0,
    maxCon = 0,
    minCon = 0,
    maxLink = 0,
    minLink = 0;

  dataset.forEach(function (character) {
    promisedResults.push(new Promise(function (resolve, reject) {
      fs.readFile(pgFolder + '/' + character.name.replace(/ /g, '_') + '_data', 'utf8',
        function (err, data) {
          if (err) {
            console.error(character.name + ': ' + err);
            resolve(new ResultObject(character.name,err));
            return;
          // reject(err)
          }
          //   var score = data.slice(data.indexOf("'score': ") + 9 , data.indexOf(','))
          try {
            // console.log(data)
            // data = data.replace(/u'(?=[^:]+')/g, "'")
            // data = data.replace(/u"(?=[^:]+")/g, '"')
            data = data.replace(/u'(?=[\w\W]+')/g,"'");
            data = data.replace(/u"(?=[\w\W]+")/g,'"');
            //   console.log(data);

            // data = data.replace(/("[^']*)'([^']*")/, '$1$2')
            data = data.replace(/("[^'"]*)'([^'"]*")/g, '$1$2');
            //   console.log(data)

            data = data.replace(/\'/g, '"');
            //   console.log(data)

            data = data.trim();
            //   console.log(data)

            var charArray = JSON.parse(data);
            var obj = new ResultObject(character.name);

            charArray.forEach(function (element) {
              obj.score += element.score;
              obj.links += element.level;
              obj.connections = obj.connections += 1;
            })
            // console.log(JSON.stringify(obj))
            resolve(obj);
          } catch(exc) {
            console.error(character.name + " " + exc );
            resolve(new ResultObject(character.name,exc));
          }
          return;
        })
    }))
  })

    promise.all(promisedResults).then(function (results) {
    results.forEach(function (result) {
        if(result.error){
            return;
        }
      if (result.links > maxLink) {
        maxLink = result.links;
      }
      if (result.connections > maxCon) {
        maxCon = result.connections;
      }
      if (result.score > maxScore) {
        maxScore = result.score;
      }
      if (result.links < minLink) {
        minLink = result.links;
      }
      if (result.connections < minCon) {
        minCon = result.connections;
      }
      if (result.score < minScore) {
        minScore = result.score;
      }
    })
    results.forEach(function (element) {
        if(element.error){
            return;
        }
      element.normalizedScore = (element.score - minScore) / (maxScore - minScore);
      element.normalizedConnections = (element.connections - minScore) / (maxCon - minCon);
      element.normalizedLinks = (element.links - minLink) / (maxLink - minLink);
    });
     console.log(JSON.stringify(results));
    });
}

// getPopularityAll([{name: 'Bran the Builder'}, {name: 'Victarion Greyjoy'}], './pagerank')

function ResultObject (name,error) {
   error =  (typeof error !== 'undefined') ? error : false;
  return {
    name: name,
    normalizedScore: '?', // normalized score count
    normalizedLinks: '?', // take literal links number
    normalizedConnections: '?', // a link means a connection -> enumerate connections
    score: 0,
    links: 0,
    connections: 0,
    error: error
  };
}
