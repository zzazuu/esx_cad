local ESX = nil

TriggerEvent('esx:getSharedObject',function(obj)
    ESX = obj
end)

----------------------------------------
--------------Register user-------------
----------------------------------------
RegisterNetEvent('cadUser:Register')
AddEventHandler('cadUser:Register', function(data)

    --Get there first and last name. 
    local name = MySQL.Sync.fetchAll('SELECT firstname, lastname FROM users WHERE identifier = @identifier', {
        ['@identifier'] = GetPlayerIdentifiers(source)[1]
    })
    local firstName = name[1].firstname
    local lastName = name[1].lastname
    local dob = name[1].dateofbirth
    --trigger a function to check if they're already in the database
    dbCheck(firstName, lastName, dob)
end)

function dbCheck(firstName, lastName, dob)
    --See if they're in the database
    local result = MySQL.Sync.fetchAll('SELECT * FROM cad_users WHERE name = @name AND dob = @dob',{
        ['@name'] = firstName.." "..lastName,
        ['@dob'] = dob
    })

    --check if there's anything returned from above. If there is, then stop. If there's not then head of and update caduser.
    if next(result) == nil then
        --add users.
        addUser(firstName, lastName, dob)
    end
end

function addUser(firstName, lastName, dob)
    --so here we already have there first name, we now need to get there DateOfBirth,Sex,Height,identifier.. Also insert License as 0
    local result = MySQL.Sync.fetchAll('SELECT * FROM characters WHERE FirstName = @firstName AND LastName = @lastName AND dateofbirth = @dob',{
        ['@firstName'] = firstName,
        ['@lastName'] = lastName,
        ['@dob'] = dob,
    })

    local DateOfBirth = result[1].dateofbirth
    local sex = result[1].sex
    local height = result[1].height
    local identifier = result[1].identifier
    
    if DateOfBirth ~= nil and sex ~= nil and height ~= nil and identifier ~= nil then
        MySQL.Async.execute('INSERT INTO cadusers (identifier, FirstName, LastName, DateOfBirth, Sex, Height, DriversLicence) VALUES (@identifier, @FirstName, @LastName, @DateOfBirth, @Sex, @Height, @DriversLicence)', --insert into cad
        {
            ['@identifier']   = identifier,
            ['@FirstName']   = firstName,
            ['@LastName'] = lastName,
            ['@DateOfBirth'] = DateOfBirth,
            ['@Sex'] = sex,
            ['@Height'] = height,
            ['@DriversLicence'] = 0
        }, function (rowsChanged)
        end)
    end
end
---------------------------------------
-------------End register user---------
---------------------------------------

----------------------------------------
--=========Start Callbacks============--
----------------------------------------

ESX.RegisterServerCallback('crumbleCad:getCitizen', function(source, cb, data)
    local userInfo = {}
    
    MySQL.Async.fetchAll(
    'SELECT * FROM `cad_users` WHERE `name` = @name and `dob` = @dob',
    {
        ['@name'] = data.firstname .. ' ' .. data.surname,
        ['@dob'] = data.dob
    },
    function(result)
        if result[1] ~= nil then
            userInfo['name'] = result[1].name
            userInfo['dob'] = result[1].dob
            userInfo['identifier'] = result[1].steamIdentifier
            userInfo['profile'] = json.decode(result[1].profile)
            cb(userInfo)
        else
            cb(false)
        end
    end)
end)

ESX.RegisterServerCallback('crumbleCad:getFines', function(source, cb, data)
    MySQL.Async.fetchAll('SELECT * FROM `cad_fines` WHERE `receiver` = @receiver and `steamIdentifier` = @steamIdentifier',{
        ['@receiver'] = data.name,
        ['@steamIdentifier'] = data.identifier
    },
    function(result)
        if next(result) ~= nil then
            cb(result)
        else
            cb(false)
        end
    end)
end)

ESX.RegisterServerCallback('crumbleCad:getWarrants',function(source, cb, data)
    MySQL.Async.fetchAll('SELECT * FROM cad_warrants WHERE receiver = @receiver and steamIdentifier = @steamIdentifier',{
        ['@receiver'] = data.name,
        ['@steamIdentifier'] = data.identifier
    },
    function(result)
        if next(result) ~= nil then
            cb(result)
        else
            cb(false)
        end
    end)
end)

ESX.RegisterServerCallback('crumbleCad:submitReport',function(source, cb, data)

    if data.name ~= nil then
        local name = {}
        local string = data.name
        
        for w in string:gmatch('%S+') do
            table.insert(name, w)
        end
        
        local identifier = GetCharacterIdentifier(name[1], name[2], data.dob)
        -- print(GetCharacterName(source))
        -- print(identifier)
        -- print(firstname .. ' ' .. lastname)
        -- print(data.report)
        -- print(convertDate(os.date('%x')))
        if identifier then
            local firstname = firstToUpper(name[1])
            local lastname = firstToUpper(name[2])

            MySQL.Async.execute('INSERT INTO cad_reports (officer,steamIdentifier,suspects_name,report,date) VALUES (@officer,@steamIdentifier,@suspects_name,@report,@date)',
            {
                ['@officer'] = GetCharacterName(source),
                ['@steamIdentifier'] = identifier,
                ['@suspects_name'] = firstname .. ' ' .. lastname,
                ['@report'] = data.report,
                ['@date'] = convertDate(os.date('%x'))
            },
            function(rowsChanged)
                if rowsChanged > 0 then
                    cb(true)
                else
                    cb(false)
                end
            end)
        else
            cb('notFound')
        end
    else
        MySQL.Async.execute('INSERT INTO cad_reports (officer,report,date) VALUES (@officer,@report, @date)',{
            ['@officer'] = GetCharacterName(source),
            ['@report'] = data.report,
            ['@date'] = convertDate(os.date('%x'))
        },
        function(rowsChanged)
            if rowsChanged > 0 then
                cb(true)
            else
                cb(false)
            end
        end)
    end
end)

ESX.RegisterServerCallback('crumbleCad:getReports',function(source, cb)
    local result = MySQL.Sync.fetchAll('SELECT * FROM cad_reports', {})
    
    if next(result) ~= nil then
        cb(result)
    else
        cb(false)
    end
end)

ESX.RegisterServerCallback('crumbleCad:GetCitizenIncidents',function(source, cb, data)
    
    local name = {}
    local string = data.name
    
    for w in string:gmatch('%S+') do
        table.insert(name, w)
    end
    
    local firstname = firstToUpper(name[1])
    local lastname = firstToUpper(name[2])
    
    local result = MySQL.Sync.fetchAll('SELECT * FROM cad_reports WHERE steamIdentifier = @steamIdentifier AND suspects_name = @name', {
        ['@steamIdentifier'] = data.identifier,
        ['@name'] = firstname.." "..lastname
    })
    
    if next(result) ~= nil then
        cb(result)
    else
        cb(false)
    end
    
end)

ESX.RegisterServerCallback('crumbleCad:getConvictions', function(source, cb, data)
    
    local name = {}
    local string = data.name
    
    for w in string:gmatch('%S+') do
        table.insert(name, w)
    end
    
    local firstname = firstToUpper(name[1])
    local lastname = firstToUpper(name[2])
    
    local result =
    MySQL.Sync.fetchAll('SELECT * FROM cad_convictions WHERE steamIdentifier = @identifier AND suspect_name = @name',
    {
        ['@identifier'] = data.identifier,
        ['@name'] = firstname.." "..lastname
    })
    
    if next(result) ~= nil then
        cb(result)
    else
        cb(false)
    end
    
end)

ESX.RegisterServerCallback('crumbleCad:deleteFine', function(source, cb, data)

    MySQL.Async.execute('DELETE FROM cad_fines WHERE officer = @officer AND reason = @reason AND date = @date',{
        ['@officer'] = data._officer,
        ['@reason'] = data._reason,
        ['@date'] = data._date
    },
    function(rowsChanged)
        if rowsChanged > 0 then
            cb(true)
        else
            cb(false)
        end
    end)
end)

ESX.RegisterServerCallback('crumbleCad:deleteWarrant', function(source, cb, data)

    MySQL.Async.execute('DELETE FROM cad_warrants WHERE officer = @officer AND reason = @reason AND date_issued = @date',{
        ['@officer'] = data._officer,
        ['@reason'] = data._reason,
        ['@date'] = data._date
    },
    function(rowsChanged)
        if rowsChanged > 0 then
            cb(true)
        else
            cb(false)
        end
    end)

end)

ESX.RegisterServerCallback('crumbleCad:getOfficerName', function(source, cb) 
    local name = GetCharacterName(source)
    cb(name)
end)

ESX.RegisterServerCallback('crumbleCad:deleteReport', function(source, cb, data)

    MySQL.Async.execute('DELETE FROM cad_reports WHERE officer = @officer AND report = @report AND date = @date',{
        ['@officer'] = data.officer,
        ['@report'] = data.report,
        ['@date'] = data.date
    },
    function(rowsChanged)
        if rowsChanged > 0 then
            cb(true)
        else
            cb(false)
        end
    end)

end)

ESX.RegisterServerCallback('crumbleCad:checkPlate', function(source, cb, data)
    
    local result = MySQL.Sync.fetchAll('SELECT * FROM owned_vehicles WHERE plate = @plate',
    {
        ['@plate'] = data.plate
    })

    if next(result) ~= nil then
        cb(result[1])
    else
        cb(false)
    end

end)

-----------------------------------------
--============Functions================--
-----------------------------------------

function GetCharacterName(source)
    local result =
    MySQL.Sync.fetchAll(
    'SELECT firstname, lastname FROM users WHERE identifier = @identifier',
    {
        ['@identifier'] = GetPlayerIdentifiers(source)[1]
    })
    
    if result[1] and result[1].firstname and result[1].lastname then
        return ('%s %s'):format(result[1].firstname, result[1].lastname)
    end
end

function GetCharacterIdentifier(firstname, lastname, dob)
    firstname = firstToUpper(firstname)
    lastname = firstToUpper(lastname)
    
    local result =
    MySQL.Sync.fetchAll(
    'SELECT identifier FROM users WHERE firstname = @firstname AND lastname = @lastname AND dateofbirth = @dob',
    {
        ['@firstname'] = firstname,
        ['@lastname'] = lastname,
        ['@dob'] = dob
    })
    
    if result[1] then
        return result[1].identifier
    else
        return false
    end
end

function firstToUpper(str)
    return (str:gsub('^%l', string.upper))
end

function convertDate(vardate)
    local d, m, y = string.match(vardate, '(%d+)/(%d+)/(%d+)')
    return string.format('%s/%s/%s', m, d, y)
end