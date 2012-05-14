Super simple version with working Todo application.

# backbone-pouchdb

A Backbone sync adapter for PouchDB (https://github.com/mikeal/pouchdb, https://github.com/daleharvey/pouchdb).


### Getting started

Check out the Todo example how it works.
Basically, just set a `pouchdb` property on your model or collection:

    Backbone.Model.extend({
      pouchdb: 'idb://mydb'
    });


### Couchapp Example

I included a couchapp version of the Todo example with replication form.

To run it:

    cd examples/todos-couchapp
    make create URL=http://localhost:5984/todos-backbone  # create database
    make URL=http://localhost:5984/todos-backbone         # push application

and visit `http://localhost:5984/todos-backbone/_design/todos/index.html`
