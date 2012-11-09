# backbone-pouchdb

A Backbone sync adapter for PouchDB (https://github.com/mikeal/pouchdb, https://github.com/daleharvey/pouchdb).


### Getting started

Check out the Todo example how it works.
Basically, just set a `pouch` property on your model or collection:

    Backbone.Model.extend({
      pouch: Backbone.sync.pouch('idb://mydb')
    });


You can ask backbone-pouchdb to fetch a collection via a view:

    pouch: Backbone.sync.pouch('idb://todos-backbone', {
      reduce: false,
      include_docs: true,
      conflicts: true,
      view: {
        map: function(doc) {
          if (doc.type === 'todo') emit([doc.order, doc.title], null);
        }
      }
    });


### TODO Sync Couchapp Example

I included a couchapp version of the Todo example with synchronisation support.

You can either run it as a Couchapp with Mouch [https://github.com/jo/mouch],
or run it locally from your filesystem.


#### Run TODO Sync from Filesystem

    git clone https://github.com/daleharvey/CORS-Proxy.git
    cd CORS-Proxy
    node server.js

This will proxy requests to http://localhost:1234 to a local CouchDB running on http://localhost:5984, adding CORS headers.


#### Install TODO Sync as a Couchapp

You need the following libraries and programs installed on your system:

* ruby
* ruby-json
* curl

`cd` to the apps directory:

    cd examples/todos-sync

Install the Couchapp:

    ./mouch app.json.erb http://localhost:5984/todos-backbone

If your CouchDB is not in admin party mode, supply the credentials in the form:

   ./mouch app.json.erb http://username:password@localhost:5984/todos-backbone


and visit `http://localhost:5984/todos-backbone/_design/todos/index.html`
