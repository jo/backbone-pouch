Super simple version with working Todo application (a modified Backbone Todo example app).
Also included is a simple Todo app with a synchronisation interface.

# backbone-pouchdb

A Backbone sync adapter for PouchDB (https://github.com/mikeal/pouchdb, https://github.com/daleharvey/pouchdb).


### Getting started

Check out the Todo example how it works.
Basically, just set a `pouch` property on your model or collection:

    Backbone.Model.extend({
      pouch: Backbone.sync.pouch('idb://mydb'),
    });


### Couchapp Example

I included a couchapp version of the Todo example with synchronisation support.

You can either run it as a Couchapp with Mouch [https://github.com/jo/mouch],
or run it locally from your filesystem.


#### Run from Filesystem

  git clone https://github.com/daleharvey/CORS-Proxy.git
  cd CORS-Proxy
  node server.js

This will proxy requests to http://localhost:1234 to a local CouchDB running on http://localhost:5984, adding CORS headers.


#### Install as Couchapp

    cd examples/todos-sync
    make create URL=http://localhost:5984/todos-backbone  # create database
    make URL=http://localhost:5984/todos-backbone         # push application

and visit `http://localhost:5984/todos-backbone/_design/todos/index.html`
