// Store models in *PouchDB*.
Backbone.sync = (function() {
  // match read request to get, query or allDocs call
  function read(db, model, options, callback) {
    // get single model
    if (model.id) return db.get(model.id, options, callback);

    // query view
    if (options.view) return db.query(options.view, options, callback);

    // all docs
    db.allDocs(options, callback);
  }

  // the sync adapter function
  var sync = function(method, model, options) {
    var pouch = model.pouch || (model.collection && model.collection.pouch);

    options || (options = {});

    if (!pouch) {
      throw('missing pouch: ' + method);
    }

    function callback(err, resp) {
      if (err) {
        if (options.error) options.error(resp);
        return;
      }
      if (options.success) options.success(resp);
    }

    model.trigger('request', model, pouch, options);

    pouch(function(err, db, defaults) {
      if (err) {
        if (options.error) options.error(err);
        return;
      }
      var opts = _.extend({}, defaults, options);
      switch (method) {
        case 'create': db.post(model.toJSON(), opts, callback);   break;
        case 'update': db.put(model.toJSON(), opts, callback);    break;
        case 'delete': db.remove(model.toJSON(), opts, callback); break;
        case 'read':   read(db, model, opts, callback);           break;
      }
    });
  };

  // extend the sync adapter function
  // to init pouch via Backbone.sync.pouch(url, options)
  sync.pouch = function(url, options) {
    var err, db, initialized,
        waiting = [];

    options || (options = {});

    return function open(callback) {
      if (initialized) {
        if (err || db) {
          // we alreay have a pouch adapter available
          callback(err, db, options);
        } else {
          waiting.push(callback);
        }
      } else {
        initialized = true;
        // open pouch
        new Pouch(url, function(e, d) {
          callback(err = e, db = d, options);
          _.each(waiting, open);
          waiting = [];
        });
      }
    }
  };

  return sync;
})();
