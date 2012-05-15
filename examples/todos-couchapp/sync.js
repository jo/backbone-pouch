// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/).
// This demo shows the use of the
// [PouchDB adapter](backbone-pouchdb.js)
// to persist Backbone models within your browser
// and to be able to replicate the data to and from a server.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Replication Model
  // -----------------

  // Our **Replication** model has an `url` attribute.
  var Replication = Backbone.Model.extend();

  // Replication Collection
  // ----------------------

  var ReplicationList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Replication,

    // Save replications in the `"replications-backbone"` database.
    // TODO: view support
    pouchdb: 'idb://replications-backbone',

    // Replications are sorted by url.
    comparator: function(replication) {
      return replication.get('url');
    }

  });

  // Create global collection of **Replications**.
  var Replications = new ReplicationList;


  // Replication Item View
  // ---------------------

  // The DOM element for a replication item...
  var ReplicationView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#replication-item-template').html()),

    // The DOM events specific to an item.
    events: {
      "click a.destroy" : "clear"
    },

    // The ReplicationView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Replication** and a **ReplicationView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    // Re-render the titles of the replication item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });

  // The Application
  // ---------------

  // Our overall **ReplicationAppView** is the top-level piece of UI.
  var ReplicationAppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#sync-app"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#sync-stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-replication":  "createOnEnter"
    },

    // At initialization we bind to the relevant events on the `Replications` and `Replications`
    // collections, when items are added or changed. Kick things off by
    // loading any preexisting replications and replications that might be saved in *PouchDB*.
    initialize: function() {

      this.input = this.$("#new-replication");

      Replications.bind('add', this.addOne, this);
      Replications.bind('reset', this.addAll, this);
      Replications.bind('all', this.render, this);

      this.stats = this.$('#sync-stats');
      this.main = $('#sync-main');

      Replications.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      var count = Replications.length;

      if (Replications.length) {
        this.main.show();
        this.stats.show();
        this.stats.html(this.statsTemplate({count: count}));
      } else {
        this.main.hide();
        this.stats.hide();
      }
    },

    // Add a single replication item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(replication) {
      var view = new ReplicationView({model: replication});
      this.$("#replication-list").append(view.render().el);
    },

    // Add all items in the **Replications** collection at once.
    addAll: function() {
      Replications.each(this.addOne);
    },

    // If you hit return in the main input field, create new **Replication** model,
    // persisting it to *PouchDB*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Replications.create({url: this.input.val()});
      this.input.val('');
    },

    replicate: function () {
      var url = this.$('#replicate input[type=url]').val();

      Pouch.replicate(url, Replications.pouchdb, function(err, resp) {
        console.log('docs pulled: ' + resp.docs_written);
        Replications.fetch();
      });
      Pouch.replicate(Replications.pouchdb, url, function(err, resp) {
        console.log('docs pushed: ' + resp.docs_written);
      });

      return false;
    }

  });

  // Finally, we kick things off by creating the **App**.
  var ReplicationApp = new ReplicationAppView;

});
