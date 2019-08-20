# esx_cad
This is a Work in progress and is no where near ready to be used. If you do decide to use this, don't rename the resource, otherwise you will break everything. 



# Install

Alright, so... Cad time! Be warned, this is still not quite ready, had a few people request it though. So if you wish to fork it and finish off the last few bits for your server, feel free to. That being said, after I have done the last few bits, it will start becoming custom to work with my custom scripts, sooo, guess now's as good a time as any shrug I will be pushing the last few bits to this git when they are done though, so it's up to you if you want to wait or not. 

Like I said when I started working on this though. This is a dev release and is not a simple plug and play resource. You will need to make changes to your resources to make this work the way it is intended and I will not be providing support to help you get it working with your server. 

To get this current release working, you will need to do two things, first off, find somewhere to trigger the cad register event I have mine in the esx_identity client.lua after the esx_skin:openSaveableMenu. You will also need to send the data from esx_identity over, this contains there rp name as well as other profile info.
```
TriggerServerEvent('cadUser:Register', data)
```
You'll then need to add a new column onto the end of the owned_vehicles table named: 
```
ownerName 
```
 set this to varchar(255).. Then go into the server.lua for esx_vehicle shop and add a function to grab the xplayer rp name from the db. Once you have this, find the sql insert query that registers the vehicle upon purchase. Append the character name you just got to this query.

https://github.com/michael86/esx_cad 
