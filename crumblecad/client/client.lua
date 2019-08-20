local ESX = nil
local name = {}

---------------------------------------------------
--==================Threads======================--
---------------------------------------------------

Citizen.CreateThread(function()
    
    SetNuiFocus(false, false)
    SendNUIMessage(({type = 'closecad'})) --incase of script restarts
    
    while ESX == nil do
        TriggerEvent('esx:getSharedObject',function(obj) ESX = obj end)
        Citizen.Wait(250)
    end
    
    while not ESX.IsPlayerLoaded() do
        Citizen.Wait(250)
    end
    
    if ESX.GetPlayerData(PlayerPedId()).job.name == 'police' then
        ESX.TriggerServerCallback('crumbleCad:getOfficerName', function(cb)
            if cb then
                while true do 
                    Citizen.Wait(0)
                    if IsControlJustReleased(0, 38) then
                        SetNuiFocus(true, true)
                        SendNUIMessage(({
                            type = 'opencad',
                            name = cb
                        }))
                    end
                end
            end
        end)
    end
end)

---------------------------------------------------
--==================Send NUI=====================--
---------------------------------------------------

---------------------------------------------------
--===============NUI CALL BACKS==================--
---------------------------------------------------
RegisterNUICallback('closeCad',function(data, cb)
    SetNuiFocus(false, false)
    SendNUIMessage(({type = 'closecad'}))
end)

RegisterNUICallback('citizenSearch',function(data, cb)
    
    ESX.TriggerServerCallback('crumbleCad:getCitizen', function(_info, _fines, _warrants)
        Citizen.Wait(100)
        
        if _info ~= false then
            SetNuiFocus(true, true)
            SendNUIMessage(
            ({
                type = 'citizenResult',
                info = _info
            }))
            
        elseif _info == false then
            
            SetNuiFocus(true, true)
            SendNUIMessage(
            
            ({
                type = 'citizenResult',
                info = nil
            }))
            
        end
        
    end, data)
end)

RegisterNUICallback('getFines', function(data)
    
    ESX.TriggerServerCallback('crumbleCad:getFines', function(cb)
        
        if cb ~= false then
            SendNUIMessage(
            ({
                type = 'fineResult',
                info = cb
            }))
        else
            SendNUIMessage(
            ({
                type = 'fineResult',
                info = nil
            }))
        end
    end, data)
    
end)

RegisterNUICallback('getWarrants', function(data)
    
    ESX.TriggerServerCallback('crumbleCad:getWarrants', function(cb)
        
        if cb ~= false then
            SendNUIMessage(
            ({
                type = 'warrantResult',
                info = cb
            }))
        else
            SendNUIMessage(
            ({
                type = 'warrantResult',
                info = nil
            }))
        end
    end, data)
end)

RegisterNUICallback('citizenIncidents', function(data)
    
    ESX.TriggerServerCallback('crumbleCad:GetCitizenIncidents', function(cb)
        
        if cb then
            SendNUIMessage(({
                type = 'citizenReports',
                info = cb
            }))
        else
            SendNUIMessage(({
                type = 'citizenReports',
                info = nil
            }))
        end
        
    end, data)
    
end)

RegisterNUICallback('getConvictions', function(data)
    
    ESX.TriggerServerCallback('crumbleCad:getConvictions', function(cb)
        print('erm lua???')
        if cb then
            print('we have a cb')
            SendNUIMessage(({
                type = 'citizenConvictions',
                info = cb
            }))
        else
            SendNUIMessage(({
                type = 'citizenConvictions',
                info = nil
            }))
        end
        
    end, data)
    
end)

RegisterNUICallback('deleteFine', function(data)
    
    ESX.TriggerServerCallback('crumbleCad:deleteFine', function(cb)
        if cb then
            SendNUIMessage(({
                type = 'fineDeleted',
                info = true
            }))
        else
            SendNUIMessage(({
                type = 'fineDeleted',
                info = false
            }))
        end
    end, data)
    
end)

RegisterNUICallback('deleteWarrant', function(data)
    
    ESX.TriggerServerCallback('crumbleCad:deleteWarrant', function(cb)
        
        if cb then
            SendNUIMessage(({
                type = 'warrantDeleted',
                info = true
            }))
        else
            SendNUIMessage(({
                type = 'warrantDeleted',
                info = false
            }))
        end
        
    end, data)
    
end)

RegisterNUICallback('submitReport', function(data)
    
    ESX.TriggerServerCallback('crumbleCad:submitReport', function(cb)
        
        if cb == true then
            SendNUIMessage(
            ({
                type = 'reportResult',
                success = true
            }))
        elseif cb == 'notFound' then
            SendNUIMessage(
            ({
                type = 'reportResult',
                success = cb
            }))
        else
            SendNUIMessage(
            ({
                type = 'reportResult',
                success = false
            }))
        end
        
    end,data)
    
end)

RegisterNUICallback('getReports', function()
    
    ESX.TriggerServerCallback('crumbleCad:getReports', function(cb)
        if cb then
            SendNUIMessage(
            ({
                type = 'updateReport',
                info = cb
            }))
        else
            SendNUIMessage(
            ({
                type = 'updateReport',
                info = nil
            }))
        end
    end)
    
end)

RegisterNUICallback('deleteReport', function(data)
    
    ESX.TriggerServerCallback('crumbleCad:deleteReport', function(cb)
        if cb then 
            SendNUIMessage(
            ({
                type = 'reportDeleted',
                info = true
            }))
        else
            SendNUIMessage(
            ({
                type = 'reportDeleted',
                info = false
            }))
        end
    end, data)
end)

RegisterNUICallback('checkPlate', function(data)
    
    ESX.TriggerServerCallback('crumbleCad:checkPlate', function(cb)
        if cb then

            local vehicleInfo = json.decode(cb.vehicle)
            local displaytext = GetDisplayNameFromVehicleModel(vehicleInfo.model)
            local vehicleName = GetLabelText(displaytext)
            local color
            
            for k,v in pairs(Config.colorNames) do
                if tonumber(vehicleInfo.color1) == tonumber(k) then
                    color = v
                    break
                end
            end

            SendNUIMessage(
            ({
                type = 'vehicleResult',
                info = cb,
                ownerName = vehicleInfo.ownerName,
                model = vehicleName,
                primaryColor = color,
            }))
        else
            SendNUIMessage(
            ({
                type = 'vehicleResult',
                info = false
            }))
        end
    end, data)
end)
---------------------------------------------------
--==================Functions====================--
---------------------------------------------------
