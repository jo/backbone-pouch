// Store models in *PouchDB*.
Backbone.sync = (function() {
  _dbs = {};

  function db(url) {
    function get(callback) {
      if (_dbs[url]) {
        callback(_dbs[url].err, _dbs[url].db);
      } else {
        // TODO: wait and try again
        console.warn('not ready, try again in 10ms... ' + url);
        _.delay(function() {
          get(callback);
        }, 10);
      }
    }

    return get;
  }

  function initialize(url) {
    new Pouch(url, function(err, db) {
      _dbs[url] = {
        err: err,
        db: db
      };
    });

    return db(url);
  }

  var sync = function(method, model, options) {
    var pouch = model.pouch || (model.collection && model.collection.pouch);

    if (!pouch) {
      console.error('missing pouch: ' + method);
      console.log(model);
      return;
    }

    function fn(err, resp) {
      err === null ? options.success(resp) : options.error(err);
    }

    pouch(function(err, db) {
      if (err === null) {
        switch (method) {
          case "read":   model.id ? db.get(model.id, { conflicts: true }, fn) : db.allDocs({ include_docs: true, conflicts: true }, fn); break;
          case "create": db.put(model.toJSON(), fn);                                               break;
          case "update": db.post(model.toJSON(), fn);                                              break;
          case "delete": db.remove(model.toJSON(), fn);                                            break;
        }
      } else {
        options.error(err);
      }
    });
  };

  sync.pouch = initialize;
  sync.dbs = _dbs;

  return sync;
})();
