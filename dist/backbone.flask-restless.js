(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (function($, _, Backbone) {
    Backbone.FlaskRestless = {
      defaultlimit: 20
    };
    Backbone.FlaskRestless.Model = (function(superClass) {
      extend(Model, superClass);

      function Model() {
        return Model.__super__.constructor.apply(this, arguments);
      }

      Model.prototype.initialize = function(opt) {
        _.each(opt, function(value, key) {
          Object.defineProperty(this, key, {
            get: function() {
              return this.get(key);
            },
            set: function(value) {
              this.set(key, value);
            },
            enumerable: true,
            configurable: true
          });
        }, this);
      };

      Model.prototype.format = function(object) {
        return object;
      };

      Model.prototype.parse = function(response) {
        return this.format(response);
      };

      return Model;

    })(Backbone.Model);
    Backbone.FlaskRestless.Collection = (function(superClass) {
      extend(Collection, superClass);

      function Collection() {
        return Collection.__super__.constructor.apply(this, arguments);
      }

      Collection.prototype.current_page = -1;

      Collection.prototype.number_of_pages = -1;

      Collection.prototype.format = function(objects) {
        return objects;
      };

      Collection.prototype.parse = function(response) {
        if (response.objects) {
          this.current_page = response.page;
          this.number_of_pages = response.total_pages;
          return this.format(response.objects);
        } else {
          return this.format(response);
        }
      };

      Collection.prototype.has_next = function() {
        return this.current_page < this.number_of_pages;
      };

      Collection.prototype.splice = function(index, howMany) {
        var args, removed;
        args = _.toArray(arguments).slice(2).concat({
          at: index
        });
        removed = this.models.slice(index, index + howMany);
        this.remove(removed).add.apply(this, args);
        return removed;
      };

      return Collection;

    })(Backbone.Collection);
    Backbone.FlaskRestless.Filter = (function(superClass) {
      extend(Filter, superClass);

      function Filter() {
        return Filter.__super__.constructor.apply(this, arguments);
      }

      Filter.prototype.defaults = {
        "name": "",
        "op": "",
        "val": ""
      };

      return Filter;

    })(Backbone.Model);
    Backbone.FlaskRestless.SearchOptions = (function() {
      function SearchOptions() {
        this.query = {};
        this.options = {};
      }

      SearchOptions.prototype.setOptions = function(options1) {
        this.options = options1;
      };

      SearchOptions.prototype.setFilters = function(filters) {
        return this.query['filters'] = filters;
      };

      SearchOptions.prototype.setOrderby = function(orderby) {
        return this.query['order_by'] = [orderby];
      };

      SearchOptions.prototype.getOptions = function() {
        var q;
        if (this.query) {
          q = {
            "q": JSON.stringify(this.query),
            "results_per_page": this.options['results_per_page'],
            "page": this.options['page']
          };
        }
        this.options['data'] = q;
        return this.options;
      };

      return SearchOptions;

    })();
    return Backbone.FlaskRestless.CollectionIterator = (function() {
      function CollectionIterator(collection) {
        this.collection = collection;
        if (this.collection.current_page !== -1) {
          this.current_page = this.collection.current_page;
        } else {
          this.current_page = 1;
        }
        this.options = new Backbone.FlaskRestless.SearchOptions();
        this.options.options['reset'] = true;
      }

      CollectionIterator.prototype.itemsPerPage = function(items_per_page) {
        if (items_per_page) {
          return this.options.options["results_per_page"] = items_per_page;
        }
      };

      CollectionIterator.prototype.setOptions = function(options) {
        if (options) {
          if (Object.keys(options).length !== 0) {
            _.extend(this.options.options, options);
          }
        }
        return this;
      };

      CollectionIterator.prototype.at = function(index) {
        if (this.collection.number_of_pages !== -1) {
          if (index >= 1 && index <= this.collection.number_of_pages) {
            this.current_page = index;
            return this.do_search();
          }
        } else if (index >= 1) {
          this.current_page = index;
          return this.do_search();
        }
      };

      CollectionIterator.prototype.next = function() {
        var next_page;
        if (this.collection.current_page !== -1) {
          this.current_page = this.collection.current_page;
          next_page = this.current_page + 1;
        }
        if (this.collection.number_of_pages === -1) {
          return this.do_search();
        } else if (next_page <= this.collection.number_of_pages) {
          this.current_page = next_page + "";
          return this.do_search();
        }
      };

      CollectionIterator.prototype.prev = function() {
        var previous_page;
        if (this.collection.current_page !== -1) {
          this.current_page = this.collection.current_page;
          previous_page = this.current_page - 1;
        }
        if (this.collection.number_of_pages === -1) {
          return this.do_search();
        } else if (previous_page >= 1) {
          this.current_page = previous_page + "";
          return this.do_search();
        }
      };

      CollectionIterator.prototype.do_search = function() {
        this.options.options["page"] = this.current_page;
        return this.collection.fetch(this.options.getOptions());
      };

      return CollectionIterator;

    })();
  })(window.$, window._, window.Backbone);

}).call(this);
