# reads all character files and outputs one JSON file.
# execute in 'awoiaf' directory!
#

import ast
import os
import json



def fixStr(str):
    str = str.replace("\\n", " ")
    str = str.replace("%20", " ")
    str = str.replace("%21", "!")
    str = str.replace("%22", "")
    str = str.replace("%27", "")
    str = str.replace("%28", "(")
    str = str.replace('%29', ')')

    return str



def readCharacter(name):
	
    f = open("Data/Charachters/info/" + name)
    str = f.read()
    f.close()
	
    info = ast.literal_eval( fixStr(str) )
    info['Name'] = fixStr(name)

    #print(json.dumps(info, sort_keys=True, indent=2))
    return info;



def processData(cdata):
	# TODO: change attribute names, parse numbers, etc.

	return cdata



def unifyJSON(outfilepath):

    data = []

    print("reading characters...")

    for name in os.listdir("Data/Charachters/info/"):
        print(name)
        cdata = readCharacter(name)
        cdata = processData(cdata)
        data.append(cdata)

    print("done.")


    print("writing JSON file...")
    fout = open(outfilepath, 'w')

    fout.write(json.dumps(data, sort_keys=True, indent=2))
    fout.write("\n\n")

    fout.close()
    print("done.")



unifyJSON("characters.json")


