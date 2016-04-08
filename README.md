# JS16_ProjectB
Game of Thrones characters are always in danger of being eliminated. The challenge in this assignment is to see at what risk are the characters that are still alive of being eliminated. The goal of this project is to rank characters by their Percentage Likelihood of Death (PLOD). You will assign a PLOD using machine learning approaches.

## Node
Install it with NPM or add it to your package.json:
```
npm install gotarffplod
```
Then:
```
var gotplod = require('gotarffplod');
```

## Usage of the packet

### init
`
gotarffplod.init();
`

Initializes the data structures. This is required before using the other functions.

### getPlod
`
gotarffplod.getPlod('name');
`

Given a name of a character, returns his PLOD.  
Returns `undefined` if the character does not exist.

### getTop
`
gotarffplod.getTop(num_top);
`

Returns `num_top` alive characters with the highest PLOD.  
Parameter `num_top` is optional. The default value is 10. 

### getTopPredicted
`
gotarffplod.getTopPredicted(num_top);
`

Returns `num_top` characters with the highest PLOD.  
Parameter `num_top` is optional. The default value is 10. 

### getAttrRank
`
gotarffplod.getAttrRank('attr_name');
`

Returns the contribution ranking of the specified attribute.  
This ranking shows how important the attribute is for the prediction.

### getAllCharPredictions
`
gotarffplod.getAllCharPredictions();
`

Return all the predictions of the characters in a map (name->plod)

### getAllAttrRanks
`
gotarffplod.getAllAttrRanks();
`

Return all the ranks of the attributes in a map (attr_name->rank)


# Examples

After require, we will need to call init() once to fill the data structures.

```
gotarffplod = require('npm.js');  
gotarffplod.init();
```
Now we are ready to use all the functionality.  

Get PLODs of specific characters:  
```
gotarffplod.getPlod("Samwell Tarly");   // 0.719
```

Get contribution ranking of an attribute:  
```
gotarffplod.getAttrRank("house");    // 0.075
```

Get the TOP-20 list of characters most likely to die:  
```
gotarffplod.getTop(20);    // [ ['cersei lannister', 1], ... ] 
```

Get all characters and attributes:  
```
var chars = gotarffplod.getAllCharPredictions();
console.log(chars);                   // {'edmure tully': 0.993, ...}
console.log(chars['edmure tully']);   // 0.993

var attrs = gotarffplod.getAllAttrRanks();
console.log(attrs);                   // {house: 0.075, ...}
```
