(function() {
    

    var opiateTpl = "<div> \
        <a href='http://reddit.com<%= permalink %>' target='none'><%= title %></a> \
        <div class='clear'></div> \
        <a href='<%= image_url %>'><img src='<%= image_url %>'></img></a> \
        </div>";

    var subredditTpl = "<input type='checkbox' name='<%= subreddit %>' \
        id='<%= subreddit %>' <% if (checked) { print('checked') } %> /> \
        <label for='<%= subreddit %>'>/r/<%= subreddit %></label>";

    window.Subreddit = Backbone.Model.extend({});

    window.SubredditList = Backbone.Collection.extend({
        model: window.Subreddit
    });

    window.SubredditView = Backbone.View.extend({
        tagName: 'li',

        template: _.template(subredditTpl),

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


    window.Opiate = Backbone.Model.extend({});

    window.OpiateList = Backbone.Collection.extend({
        model: window.Opiate
    });

    window.OpiateView = Backbone.View.extend({
        tagName: 'li',

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

        initialize: function() {
            _.bindAll(this, 'addImage', 'addSubreddit');
            window.OpiateList.bind('add', this.addImage);
            window.SubredditList.bind('add', this.addSubreddit);
        },

        addImage: function(opiate) {
            var view = new window.OpiateView({
                model: opiate,
                id: opiate.id
            });
            $('#opiates').append(view.render().el);
        },

        addSubreddit: function(subreddit) {
            var view = new window.SubredditView({
                model: subreddit
            });
            $('#options').append(view.render().el);
        }

    });

    var main = function() {
        var socket = new io.Socket();
        window.App = new window.Procrastinator;

        _.each(['pics', 'funny', 'comics', 'inglip'], function(item) {
            var subreddit = new window.Subreddit({
                'subreddit': item,
                'checked': false
            });
            window.App.addSubreddit(subreddit);
        });

        socket.on('connect', function(){ 
            console.log('connected');
        }) 
        socket.on('message', function(data){ 
            var opiate = new window.Opiate(data);
            window.App.addImage(opiate);
        })
        socket.on('disconnect', function(){})
        socket.connect();
    }
    $(document).ready(main);
})();
