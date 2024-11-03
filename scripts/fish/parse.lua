function SplitFilename(strFilename)
    -- Returns the Path, Filename, and Extension as 3 values
    return string.match(strFilename, "(.-)([^\\]-([^\\%.]+))$")
end
   
local scriptPath = string.sub(debug.getinfo(1).source, 2, -1)

print(package.path)
print(scriptPath)
   
package.path = package.path .. ";" .. SplitFilename(scriptPath) .. "?.lua;"

local fishes = require("fish_fish.lua")

for k, v in pairs(fishes) do
    print(k, v)
end