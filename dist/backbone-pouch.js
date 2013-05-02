/*! backbone-pouch - v1.0.0 - 2013-05-02
* http://jo.github.io/backbone-pouch/
* Copyright (c) 2013 Johannes J. Schmidt; Licensed MIT */
(function(root) {
  'use strict';
  
  var BackbonePouch;
  if (typeof exports === 'object') {
    BackbonePouch = exports;
  } else {
    BackbonePouch = root.BackbonePouch = {};
  }

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require === 'function')) {
    _ = require('underscore');
  }

  var methodMap = {
    'create': 'post',
    'update': 'put',
    'patch':  'put',
    'delete': 'remove'
  };

  BackbonePouch.defaults = {
    fetch: 'allDocs',
    listen: true,
    options: {
      post: {},
      put: {},
      get: {},
      remove: {},
      allDocs: {
        include_docs: true
      },
      query: {
        include_docs: true
      },
      spatial: {
        include_docs: true
      },
      changes: {
        continuous: true,
        include_docs: true
      }
    }
  };

  function applyDefaults(options, defaults) {
    options.options = options.options || {};
    defaults.options = defaults.options || {};

    // merge toplevel options
    if (typeof options.fetch === 'undefined') {
      options.fetch = defaults.fetch;
    }
    if (typeof options.listen === 'undefined') {
      options.listen = defaults.listen;
    }
    if (typeof options.db === 'undefined') {
      options.db = defaults.db;
    }

    // merge PouchDB options
    _.each(defaults.options, function(value, key) {
      options.options[key] = options.options[key] || {};
      _.extend(options.options[key], value);
    });
  }

  // backbone-pouch sync adapter
  BackbonePouch.sync = function(defaults) {
    defaults = defaults || {};
    applyDefaults(defaults, BackbonePouch.defaults);

    var adapter = function(method, model, options) {
      options = options || {};
      applyDefaults(options, model.pouch || {});
      applyDefaults(options, defaults);

      // ensure we have a pouch db adapter
      if (!options.db) {
        throw new Error('A "db" property must be specified');
      }

      function callback(err, response) {
        if (err) {
          return options.error && options.error(err);
        }
        if (method === 'create' || method === 'update' || method === 'patch') {
          response = {
            _id: response.id,
            _rev: response.rev
          };
        }
        if (method === 'delete') {
          response = {};
        }
        if (method === 'read') {
          if (response.rows) {
            response = _.map(response.rows, function(row) {
              // use `doc` value if present
              return row.doc ||
                // or use `value` property otherwise
                // and inject id
                _.extend({
                  _id: row.id
                }, row.value);
            });
          }
          if (options.listen) {
            // TODO:
            // * implement for model
            // * allow overwriding of since.
            options.db.info(function(err, info) {
              // get changes since info.update_seq
              options.db.changes(_.extend({}, options.options.changes, {
                since: info.update_seq,
                onChange: function(change) {
                  var todo = model.get(change.id);

                  if (change.deleted) {
                    if (todo) {
                      todo.destroy();
                    }
                  } else {
                    if (todo) {
                      todo.set(change.doc);
                    } else {
                      model.add(change.doc);
                    }
                  }

                  // call original onChange if present
                  if (typeof options.options.changes.onChange === 'function') {
                    options.options.changes.onChange(change);
                  }
                }
              }));
            });
          }
        }
        return options.success && options.success(response);
      }

      model.trigger('request', model, options.db, options);

      if (method === 'read') {
        // get single model
        if (model.id) {
          return options.db.get(model.id, options.options.get, callback);
        }
        // query view or spatial index
        if (options.fetch === 'query' || options.fetch === 'spatial') {
          if (!options.options[options.fetch].fun) {
            throw new Error('A "' + options.fetch + '.fun" object must be specified');
          }
          return options.db[options.fetch](options.options[options.fetch].fun, options.options[options.fetch], callback);
        }
        // allDocs or spatial query
        options.db[options.fetch](options.options[options.fetch], callback);
      } else {
        options.db[methodMap[method]](model.toJSON(), options.options[methodMap[method]], callback);
      }

      return options;
    };

    adapter.defaults = defaults;

    return adapter;
  };
}(this));
