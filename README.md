# backbone-pouch

A Backbone sync adapter for [PouchDB](http://pouchdb.com/).


### Getting started

Per model:

    var MyModel = Backbone.Model.extend({
      sync: BackbonePouch.sync(options)
    })

    
Set BackbonePouch sync globally:

    Backbone.sync = BackbonePouch.sync(defaults)

    var MyModel = Backbone.Model.extend({
      pouch: options
    })


## Options handling:

1. BackbonePouch defaults
2. BackbonePouch.sync defaults
3. pouch options
4. save / get / destroy / fetch options
    

    // TODO: link to specific sections on pouchdb.com
    Backbone.Model.extend({
      sync: BackbonePouch.sync(),
      pouch: {
        db: Pouch('dbname', {}),

        options: {
          // Options for document creation. Currently no options supported
          post: {},           

          // Options for document update. Currently no options supported
          put: {}

          // Options for document deletion. Currently no options supported
          remove: {}

          // Options for fetching a single document
          get: {
            revs: true,         // Include revision history of the document. Default is false.
            revs_info: true,    // Include a list of revisions of the document, and their availability. Default is false.
            open_revs: 'all',   // Fetch all leaf revisions if open_revs='all'. Default is false.
            conflicts: true,    // If specified conflicting leaf revisions will be attached in _conflicts array. Default is false.
            attachments: true   // Include attachment data. Default is false.
          },

          // Type of fetch
          fetchMethod: 'query', // possible values are 'allDocs' (default), 'query', 'spatial'
          // allDocs options
          allDocs: {},
          // spatial options
          spatial: {},
          // Query options
          query: {
            fun: {
              map: function(doc) { emit(doc._id, null) },                     // Map function
              reduce: function(keys, values, rereduce) { return keys.length } // Optional reduce function
            },
            // fun: 'mydoc/myview', // Can be a named view in design document
            include_docs: true,     // Default is true.
            reduce: false,          // Default is true if there is a reduce function
            include_docs: true,     // Default is true
            limit: 10,              // Default is undefined
            descending: false,      // Default is undefined
            startkey: 'aaa',        // Default is undefined
            endkey: 'zzz',          // Default is undefined
            // key: 'abc',          // Default is undefined
            // keys: ['abc', 'def'] // Default is undefined
          }
        }
      }
    });


You can also set backbone-pouch globally:

    Backbone.sync = BackbonePouch.sync


Refer to the [PouchDB API Documentation](http://pouchdb.com/api.html) for more options.


### Examples

I adapted Backbone's Todo Example to use backbone-pouch:

[Simple Todo App](http://jo.github.com/backbone-pouch/examples/todos)


I also included a synchronizable Todo example,
which can replicate todo entries to and from CouchDB servers:

[Syncing Todo App](http://jo.github.com/backbone-pouch/examples/todos-sync/_attachments)


