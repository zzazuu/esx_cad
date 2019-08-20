resource_manifest_version '44febabe-d386-4d18-afbe-5e627f4af937'

server_scripts {
    '@mysql-async/lib/MySQL.lua',
	'config.lua',
	'server/server.lua',
}

client_scripts {
	'config.lua',
	'client/client.lua',
}

ui_page{
    'html/index.html'
}

files {
    'html/script.js',
    'html/bootstrap.js',
    'html/index.html',
    'html/style.css',
    'html/bootstrap.css',
    'html/images/background.png',
}

dependency {
	'mythic_notify',
}