// Store models in *PouchDB*.

(function() {
  // all those could be higher order functions, right?
  function get(database, model, options) {
    console.log('get');
    pouch.open(database, function(err, db) {
      db.get(model.id, function(err, doc) {
        err === null ? options.success(doc) : options.error(err);
      });
    });
  }
  
  function allDocs(database, options) {
    pouch.open(database, function(err, db) {
      db.allDocs({ include_docs: true }, function(err, doc) {
        err === null ? options.success(doc) : options.error(err);
      });
    });
  }
  
  function write(database, model, options) {
    pouch.open(database, function(err, db) {
      db.put(model.toJSON(), function(err, resp) {
        err === null ? options.success(resp) : options.error(err);
      });
    });
  }
  
  function destroy(database, model, options) {
    pouch.open(database, function(err, db) {
      db.remove(model.toJSON(), function(err, resp) {
        err === null ? options.success(resp) : options.error(err);
      });
    });
  }
  
  Backbone.sync = function(method, model, options) {

    var database = model.database || model.collection.database;

    switch (method) {
      case "read":   model.id ? get(database, model, options) : allDocs(database, options); break;
      case "create": write(database, model, options);                                       break;
      case "update": write(database, model, options);                                       break;
      case "delete": destroy(database, model, options);                                     break;
    }
  };
})();
