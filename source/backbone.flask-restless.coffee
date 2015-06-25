(($,_,Backbone)->
  Backbone.FlaskRestless =
    defaultlimit: 20
  class Backbone.FlaskRestless.Model extends Backbone.Model
    initialize: (opt) ->
        _.each(opt, (value, key) ->
            Object.defineProperty(@, key, {
                get: () ->
                    @get(key)
                set: (value) ->
                    @set(key, value)
                    return
                enumerable: true
                configurable: true
            })
            return
        @)
        return
    format: (object) ->
        object
    parse: (response) ->
      @format(response)

  class Backbone.FlaskRestless.Collection extends Backbone.Collection
    current_page: -1
    number_of_pages: -1
    format: (objects) ->
        objects
    parse: (response)->
      if response.objects
        @current_page = response.page
        @number_of_pages = response.total_pages
        return @format(response.objects)
      else
        return @format(response)
    has_next: ->
      @current_page < @number_of_pages
    # support handsontable
    splice: (index, howMany) ->
      args = _.toArray(arguments).slice(2).concat(at: index)
      removed = @models.slice(index, index + howMany)
      @remove(removed).add.apply(@, args);
      removed

  class Backbone.FlaskRestless.Filter extends Backbone.Model
    defaults:
      "name": ""
      "op": ""
      "val": ""

  class Backbone.FlaskRestless.SearchOptions
    constructor: () ->
      @query = {}
      @options = {}
    setOptions: (@options) ->
    setFilters: (filters) ->
      @query['filters'] = filters
    setOrderby: (orderby) ->
      @query['order_by'] = [orderby]
    getOptions: () ->
      if @query
        q =
          "q": JSON.stringify(@query)
          "results_per_page": @options['results_per_page']
          "page": @options['page']
      @options['data'] = q
      @options

  class Backbone.FlaskRestless.CollectionIterator
    constructor: (@collection) ->
      if @collection.current_page != -1
        @current_page = @collection.current_page
      else
        @current_page = 1
      @options = new Backbone.FlaskRestless.SearchOptions()
      @options.options['reset'] = true

    itemsPerPage: (items_per_page) ->
      if items_per_page
        @options.options["results_per_page"] = items_per_page

    setOptions: (options) ->
      if options
        if Object.keys(options).length !=0
          _.extend(@options.options, options)
      @

    at: (index) ->
      if @collection.number_of_pages !=-1
        if index>=1 and index <= @collection.number_of_pages
          @current_page = index
          @do_search()
      else if index>=1
        # just try
        @current_page = index
        @do_search()
        
    next: () ->
      if @collection.current_page != -1
        @current_page = @collection.current_page
        next_page = @current_page + 1
      if @collection.number_of_pages == -1
        @do_search()
      else if next_page <= @collection.number_of_pages
        @current_page = next_page + ""
        @do_search()

    prev:->
      if @collection.current_page != -1        
        @current_page = @collection.current_page
        previous_page = @current_page - 1
      if @collection.number_of_pages == -1
        @do_search()
      else if previous_page >= 1
        @current_page = previous_page + ""
        @do_search()

    do_search: () ->
      @options.options["page"] = @current_page
      @collection.fetch(@options.getOptions())

)(window.$, window._, window.Backbone)
