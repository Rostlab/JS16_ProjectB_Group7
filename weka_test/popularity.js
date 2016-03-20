var fs = require('fs');
var promise = require('promise');
var centrality = require('ngraph.centrality');
var graph = require('ngraph.graph')();
var promisedResults = [];

module.exports = getPopularityAll

function getPopularityAll(dataset, pgFolder) {
    var maxScore = 0,
        minScore = 0,
        maxCon = 0,
        minCon = 0,
        maxLink = 0,
        minLink = 0;

    dataset.forEach(function(character) {
        try {
            data = fs.readFileSync(pgFolder + '/' + character.name.replace(/ /g, '_') + '_data', 'utf8');
            data = data.replace(/u'(?=[\w\W]+')/g, "'");
            data = data.replace(/u"(?=[\w\W]+")/g, '"');

            data = data.replace(/("[^'"]*)'([^'"]*")/g, '$1$2');
            data = data.replace(/\'/g, '"');
            data = data.trim();

            var charArray = JSON.parse(data);
            obj = new ResultObject(character.name);

            charArray.forEach(function(element) {
                obj.score += element.score;
                obj.links += element.level;
                obj.connections = obj.connections += 1;
            })
            promisedResults.push(obj);
            // console.log(character.name);
        } catch (exc) {
            console.error(character.name + " " + exc);
            promisedResults.push(new ResultObject(character.name, exc));
        }
    });

    promisedResults.forEach(function(result) {
        if (result.error) {
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
    });
    promisedResults.forEach(function(element) {

        var char = dataset.filter(function(character) {
            return character.name === element.name;
        })[0];

        if (element.error) {
            char.normalizedScore = "?";
            char.normalizedConnections = "?";
            char.normalizedLinks = "?";
            return;
        }
        // element.normalizedScore = (element.score - minScore) / (maxScore - minScore);
        // element.normalizedConnections = (element.connections - minScore) / (maxCon - minCon);
        // element.normalizedLinks = (element.links - minLink) / (maxLink - minLink);

        char.normalizedScore = (element.score - minScore) / (maxScore - minScore);
        char.normalizedConnections = (element.connections - minScore) / (maxCon - minCon);
        char.normalizedLinks = (element.links - minLink) / (maxLink - minLink);
    });
    // return promisedResults;
};

// getPopularityAll([{ name: 'Bran the Builder' }, { name: 'Victarion Greyjoy' }], './pagerank')

function ResultObject(name, error) {
    error = (typeof error !== 'undefined') ? error : false;
    return {
        name: name,
        // normalizedScore: '?', // normalized score count
        // normalizedLinks: '?', // take literal links number
        // normalizedConnections: '?', // a link means a connection -> enumerate connections
        score: 0,
        links: 0,
        connections: 0,
        error: error
    };
}
