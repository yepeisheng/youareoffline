local AceDB = LibStub("AceDB-3.0", true)

local waitTable = {};
local waitFrame = nil;
function wait(delay, func, ...)
  if(type(delay)~="number" or type(func)~="function") then
    return false;
  end
  if(waitFrame == nil) then
    waitFrame = CreateFrame("Frame","WaitFrame", UIParent);
    waitFrame:SetScript("onUpdate",function (self,elapse)
      local count = #waitTable;
      local i = 1;
      while(i<=count) do
        local waitRecord = tremove(waitTable,i);
        local d = tremove(waitRecord,1);
        local f = tremove(waitRecord,1);
        local p = tremove(waitRecord,1);
        if(d>elapse) then
          tinsert(waitTable,i,{d-elapse,f,p});
          i = i + 1;
        else
          count = count - 1;
          f(unpack(p));
        end
      end
    end);
  end
  tinsert(waitTable,{delay,func,{...}});
  return true;
end

local localDB = AceDB:New("MessageRecords")
function startTrackRaidGroup()
	print("Checking raid group")
	local i = 1;
	local all = "PARSESTART";
	while (GetRaidRosterInfo(i) ~= nil) do
		name = select(1, GetRaidRosterInfo(i));
		online = select(8, GetRaidRosterInfo(i));
		if online then
			all = all .. name .. ":true;"
		else
			all = all .. name .. ":false;"
		end
		print(name)
		print(online)
	i = i + 1;
	end
	all = all .. "PARSEEND"
	print(all)
	MessageRecords.SUMMARY = all;
	wait(5, startTrackRaidGroup);
end

startTrackRaidGroup()