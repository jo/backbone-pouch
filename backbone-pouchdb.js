// Store models in *PouchDB*.
Backbone.sync = function(method, model, options) {
  function fn(err, resp) {
    err === null ? options.success(resp) : options.error(err);
  }

  new Pouch(model.database || model.collection.database, function(err, db) {
    if (err === null) {
      switch (method) {
        case "read":   model.id ? db.get(model.id, fn) : db.allDocs({ include_docs: true }, fn); break;
        case "create": db.put(model.toJSON(), fn);                                               break;
        case "update": db.post(model.toJSON(), fn);                                              break;
        case "delete": db.remove(model.toJSON(), fn);                                            break;
      }
    } else {
      options.error(err);
    }
  });
};
