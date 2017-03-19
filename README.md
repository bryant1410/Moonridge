## Deprecated notice
I don't maintain this anymore, so use only if you're willing to fix bugs yourself.

Moonridge    [![Build Status](https://travis-ci.org/capaj/Moonridge.svg?tag=1.0.3)](https://travis-ci.org/capaj/Moonridge) [![Dependency Status](https://david-dm.org/capaj/Moonridge.svg)](https://david-dm.org/capaj/Moonridge)
=========
[![NPM badge](https://nodei.co/npm/moonridge.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/moonridge/)

isomorphic [client side library](https://github.com/capaj/Moonridge-client) and server framework, which brings Mongoose model to the browser(or over the network to other node process). Based on [socket.io-rpc](https://github.com/capaj/socket.io-rpc). Framework agnostic-usable with anything-let it be Angular, Aurelia, React or any other.


Probably the coolest feature is live queries. These are performance hungry, but Moonridge is caching live queries in memory, so that one query is being live checked only once. If 10000 users run the same query, the DB performance performs the same amount of operations as if one user was accessing it. So your DB should be under the same load no matter how many people use your web app(presuming they are not writing into the DB).

## Install
```
npm i moonridge -S
```

### How to use it?
[Serverside API](https://github.com/capaj/Moonridge/wiki/API) is quite straightforward, if still not sufficent, read source code of examples.

in smoke test folder([Angular](test/e2e-smoketest/angular)|[React](test/e2e-smoketest/react)|[Aurelia](test/e2e-smoketest/aurelia)), 

## Basic usage serverside
```javascript
    var MR = require('moonridge')

	MR.connect("mongodb://localhost/moonridge_showcase") //MongoDB address is optional-you can connect as always with mongoose
	var mongoose = MR.mongoose
    var bookModel = MR.model('book', {  //mongoose schema definition
            name: String,
            author: String
        }, {
             schemaInit: function (schema) {
                // makes sure only one book per nameXauthor exists
                schema.index({ name: 1, author: 1 }, { unique: true, dropDups: true });
            }
        })
    ...
    var app = require('express')()
    var server = require('http').Server(app)
    //bookModel is an extended mongoose model, so if you know how to work with mongoose models, you'll be right at home
    MR.bootstrap(server) 
    app.use('/api', MR.baucis()) // gives your REST api for your DB in case you need it alongside to socket.io API
    server.listen(port, () => {
          app.emit('listening')
          console.log('started listening on ' + port, ' in ', env, new Date())
    })
```
## On the CLIENT:
```javascript
   	var Moonridge = require('moonridge-client')
	//Moonridge backend
	var mr = Moonridge({url: 'http://localhost:8080', hs: {query: 'nick=testUser'}})
	var fighterModel = mr.model('fighter')
	//live query
	var LQ = fighterModel.liveQuery().sort('health').exec()

	LQ.promise.then(function(){
	  LQ.result //has a result of the query-array or a number
	  //query is live now
	});
	//create a new entity
	fighterModel.create({name: 'Arya', health: 50}).then(function(created){
	  console.log('created a fighter: ', created)
	  //LQ.result now also contains Arya
	  created.health = 49
	  //update an entity
	  fighterModel.update(created).then(function () {
  	    //remove it from DB
  	    fighterModel.remove(created)
	  });
	});
```    
Also you need to connect to your backend-just pass a simple object with url property like [HERE](https://github.com/capaj/Moonridge/blob/master/test/e2e-smoketest/react/Fighters.jsx#L7).

The whole client side api for queries shadows the [Mongoose query API](http://mongoosejs.com/docs/api.html#query-js).

## Errorhandling

All server-client communication is done with [socket.io-rpc](https://github.com/capaj/socket.io-rpc)-another project of mine, so errors are propagated for all server-side calls which return an error(or reject their promise). This is especially helpful with schema validation errors, where backend tells the frontend exactly what failed.

## Supported browsers
### Desktop
    Internet Explorer 8+ - though it needs es5shim
    Safari 4+
    Google Chrome 4+
    Firefox 4+
    Opera 10.61+
### Mobile
    iPhone Safari
    iPad Safari
    Android WebKit
    WebOs WebKit

### Why not just a ported mongoosejs on the client side?
One could ask why not just port mongoosejs to the client side and let clients talk to mongo directly. While this would surely be an interesting project, Moonridge has features which would not be possible without a server instance(live querying, custom authorization/authentication). I think these features are worth it introducing a new framework to the backend.

## How does live querying work in one paragraph
Every client liveQuery is serialized and sent via socket.io to backend. Backend parses it and constructs real mongoose query, which is immediately run(if it doesn't exist already in server memory). The return is sent back to client. Any change to a certain document (creation, deletion, update) is checked again for all in-memory queries. MongoDB checks just one recently changed document, not the whole query, so it should be pretty quick. If query is satisfied, the changed document is propagated to listening clients. And that is basically it.

## But mongoDB doesn't have JOINs!
Yes I know and if you need joins, you better look for something else. Moonridge is tailored for web apps which do a lot of small and custom queries. Basically you would want to save any bit of bandwith and show pieces of data in your app as soon as possible, you are best served using Moonridge.

## Production samples
I have few production apps running on moonrige, feel free to take a peek how moonridge is used:

 - [sbirejto.cz](https://github.com/capaj/postuj-hovna)

Pull requests are welcome and same goes for issues!
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
