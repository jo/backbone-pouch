# backbone-pouchdb

A Backbone sync adapter for [http://pouchdb.com/](PouchDB).


### Getting started

Basically, you just define a `pouch` property on your model or collection:

    Backbone.Model.extend({
      pouch: Backbone.sync.pouch('mydb')
    });

`Backbone.sync.pouch` acceps an `options` object as second parameter,
where you can define options which are passed to PouchDB.
For example, you can instruct PouchDB to include the document on view responses:

    pouch: Backbone.sync.pouch('todos-backbone', {
      include_docs: true
    });


You can ask backbone-pouchdb to fetch a collection via a view:

    pouch: Backbone.sync.pouch('todos-backbone', {
      reduce: false,
      include_docs: true,
      conflicts: true,
      view: {
        map: function(doc) {
          if (doc.type === 'todo') emit([doc.order, doc.title], null);
        }
      }
    });


Refer to the [PouchDB API Documentation](http://pouchdb.com/api.html) for more options.


### Todo Example

I adapted Backbone's Todo Example to use backbone-pouchdb:
[Run Todo Example App](http://jo.github.com/backbone-pouchdb/examples/todos)


### Todo Sync Couchapp Example

I also included a synchronizable Todo example,
which can replicate todo entries to and from CouchDB servers.

Install as [Couchapp](http://couchapp.org):

* with the included [Mouch script](https://github.com/jo/mouch),
* use [erica](https://github.com/benoitc/erica),
* use the (depricated) [Python Couchapp Tool](https://github.com/couchapp/couchapp) (untested)

or run it locally from your filesystem by using a CORS proxy.
(Future versions of CouchDB will support CORS, so no proxy will be neccessary.)


#### Run Todo Sync from Filesystem with CORS Proxy

    git clone https://github.com/daleharvey/CORS-Proxy.git
    cd CORS-Proxy
    node server.js

This will proxy requests to http://localhost:1234 to a local CouchDB running on http://localhost:5984, adding CORS headers.


#### Install Todo Sync as a Couchapp


##### With Mouch

    ./mouch app.json.erb http://localhost:5984/todos-backbone

##### With Erica

    erica push http://localhost:5984/todos-backbone


The Couchapp will be served from
[localhost:5984/todos-backbone/_design/todos/index.html](http://localhost:5984/todos-backbone/_design/todos/index.html)
