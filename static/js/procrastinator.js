(function() {
    

    var opiateTpl = "<div> \
    <a href='http://reddit.com<%= permalink %>' target='none'><%= title %></a> \
    <div class='clear'></div> \
    <a href='<%= image_url %>'><img src='<%= image_url %>'></img></a> \
    </div>";

    window.Opiate = Backbone.Model.extend({});

    window.OpiateList = Backbone.Collection.extend({
        model: window.Opiate
    })

    window.OpiateView = Backbone.View.extend({
        tagName: 'li',

        maxWidth: $('#content').width(),

        template: _.template(opiateTpl),

        initialize: function() {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.view = this;
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
    });

    window.Procrastinator = Backbone.View.extend({
      el: $('#opiates'),

      initialize: function() {
        _.bindAll(this, 'addOne');

        window.OpiateList.bind('add', this.addOne);

      },

      addOne: function(opiate) {
        var view = new window.OpiateView({
            model: opiate,
            id: opiate.id
        });
        $('#opiates').append(view.render().el);
      },

    });

    var main = function() {
        var socket = new io.Socket();
        window.App = new window.Procrastinator;

        socket.on('connect', function(){ 
            console.log('connected');
        }) 
        socket.on('message', function(data){ 
            var opiate = new window.Opiate(data);
            window.App.addOne(opiate);
        })
        socket.on('disconnect', function(){})
        socket.connect();
    }
    main();
})();
