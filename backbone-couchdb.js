// CouchDB specific adjustments to Backbone

// id attribute
// http://backbonejs.org/docs/backbone.html#section-34
Backbone.Model.prototype.idAttribute = '_id';


// parse models
Backbone.Model.prototype.parse = function(response) {
  // adjust rev
  if (response.rev) {
    response._rev = response.rev;
    delete response.rev;
  }

  // adjust id
  if (response.id) {
    response._id = response.id;
    delete response.id;
  }

  // remove ok
  delete response.ok;

  return response;
};


// parse collections
Backbone.Collection.prototype.parse = function(response) {
  return response.rows && _.map(response.rows, function(row) { return row.doc || row.value });
};


// save models (update rev)
Backbone.Model.prototype.save = (function() {
  var oldSave = Backbone.Model.prototype.save;

  return function(attributes, options) {
    options || (options = {});

    var success = options.success;

    options.success = function(model, response) {
      model.set({ _rev: response._rev }, { silent: true });

      if (typeof success === 'function') {
        success(model, response);
      }
    };

    oldSave.call(this, attributes, options);
  };
})();


// delete models (append rev)
Backbone.Model.prototype.destroy = (function() {
  var oldDestroy = Backbone.Model.prototype.destroy;

  return function(options) {
    options || (options = {});
    options.headers || (options.headers = {});

    options.headers['If-Match'] = this.get('_rev');

    oldDestroy.call(this, options);
  };
})();

