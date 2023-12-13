# VAPI General Server

- [Setup](#setup)
- [Start](#start)
- [Uses](#uses)

This is an http server meant to handle a collection of static files and can be setup as a simple website or a place to hold resource files.

## Setup

1) Config Data/File:
This is a file setup and passed to the vhp-webserver class OR the start server function.
`
{
    port: NUMBER|4000 (the port to run server on)
    connectCB: FUNCTION|()=>{} (call back to run after started successfully)
    resources:{
        views: BOOLEAN|TRUE (used to declare the "controls" folder will be used)
        react: BOOLEAN|FALSE (used to declare the "app" folder will be used)
        root: String (path the created 'resources' file)
    }
}
`
2) Resource Folders:
A folder ('resources') can created any where in the project or computer. The root property must be passed a full path ending in 'resources'. Subfolders would include: "controls","public","app","errors". Needed folders will depend on the server's [use](#uses) case.

public - organize as fits. Url is full path.

constrols - Holds .html documents. Organization is similiar to public with the exeption of index.html. An index file can be placed at the root of a control folder to act as a 'home' page. The url would look like this -> 'www.example.com/page1'.
*MORE TO DEVELOP HERE - no need to start anything now as our focus moves towards sterving react apps*

app - Holds any react apps. Applications are included by adding subfolders to the 'app' folder. There is no nesting of apps. Inside the app folder can be the whole build.

errors - 

## Start
1) const vhpws = require('vhp-ws');
2) let server = new vhpws(config);

Step two will setup and then start the server. Any other needed code can be placed inbetween the two steps. The connection can be checked by "listening" to the server.connected property.
` server.connected.then(answer=>{}) `
Answer will return whatever call back was passed to config.connectedCB. On failure, the promise returns
`
{
    success:false,
    msg:err
}
`
On success, the defualt of config.connectedCB returns
`
{
    success:true,
    msg:'Enjoy'
}
`
If a function is config.connectedCB it can return anything they need

## Uses

1) Website:
A simple set of client pages can be setup by using the public folder as the root. There the files can be requested and served by their full paths. It may be more desirable to serve the pages without the extensions included. For this the Controllers folder can be setup with the pages to serve. Controllers will hold .html files by default (only option available), but could be setup to serve other types of content.

2) React App Server:
If turned on, the server will try to match the url with a react app before it ckecks anywhere else. Apps will be inside the app folder, and named with the public name used in url. It is important to not have any folders in either controls OR public that matchs a react app.
.
Folder Structure Example:
.
"apps" (folder structure)
->react-app1
    ->index.html
    ->static
        ->javascript->somefile.js
->react-app2
    ->index.html
    ->static
        ->javascript->somefile.js
.
Apps will be opened when the ending of the url matchs on of the files. If there is no match there it checks if any other part of the url contains any of the apps. With a match, it takes that point of the url forward to see if that sub-path matchs anything in the apps folder.
.
<b>URL Examples:</b>
.
- url to open app => www.example.com/react-app1
- url to open an apps resource file = www.example.com/react-app1/static/javascript/somefile.js
Alternatively you could have string(s) before react-app1 appears. The following would also be accepted
- url to open app=> www.example.com/admin/react-app1
- url to open an apps resource file = www.example.com/admin/react-app1/static/javascript/somefile.js
When adding or editing the apps build files it is important to edit the paths used by the index.html file. All relative files used need to start with the apps name like so, "/react-app1/static/javascript/somefile.js".

3) Repository:
The public folder will always be available through the server, and can be organized as a repository for other servers. There is a default *locked for now* list of file extensions and matching MIME types. As working will different files is properly tested and proved not to cause an error, more will be added to the list. The list is structured as follows:
`
[
    {ext:'\.js$',type:'text/javascript'},
    {ext:'\.css$',type:'text/css'},
    {ext:'\.html$',type:'text/html'},
    {ext:'\.png$',type:'image/png'},
    {ext:'\.json$',type:'application/json'},
    {ext:'\.map$',type:'application/json'},
    {ext:'\.ico$',type:'image/x-icon'}
]
`


-START-
Once the correct branch is checked out, ensure the appropriate node modules are installed. The server can then be started from the command line. The startup does not change if the repository needs to be run in a network of servers.

at the root:
- npm install - (to ensure the modules are there)
- npm run repo - (to start the server)
