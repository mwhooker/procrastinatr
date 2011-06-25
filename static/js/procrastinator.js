(function() {
    

    var opiateTpl = "<div> \
        <a href='http://reddit.com<%= permalink %>' target='none'><%= title %></a> \
        <div class='clear'></div> \
        <a href='<%= image_url %>'><img src='<%= image_url %>'></img></a> \
        </div>";

    var subredditTpl = "<input type='checkbox' name='<%= subreddit %>' \
        id='<%= subreddit %>' <% if (checked) { print('checked') } %> /> \
        <label for='<%= subreddit %>'>/r/<%= subreddit %></label>";

    //subreddit & page
    window.Page = Backbone.Model.extend({});

    window.Subreddit = Backbone.Model.extend({
        toggle: function(checked) {
            console.log(this.get('subreddit'));
            console.log(checked);
            this.set({'checked': checked});
        }
    });

    window.SubredditList = Backbone.Collection.extend({
        model: window.Subreddit,

        active: function() {
            return this.filter(function(subreddit) {
                return subreddit.get('checked');
            });
        }

        /*
        pageList: function() {
            return this.map(function(subreddit) {
                var page = new window.Page({
                    'subreddit': subreddit.get('subreddit'),
                    'page': null
                });
                if (subreddit.get('checked')) {
                    return page;
                }
            });
        }
        */
    });

    window.Subreddits = new SubredditList;

    window.SubredditView = Backbone.View.extend({
        tagName: 'li',

        template: _.template(subredditTpl),

        events: {
            'change input': "toggle"
        },

        initialize: function() {
            _.bindAll(this, 'render');
            this.model.bind('change', this.updateHash);
            this.model.view = this;
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },

        updateHash: function() {
            var path = location.path || '';
            var active = Subreddits.active().map(function(item) {
                return item.get('subreddit');
            });
            var newPath = path + '#' + active.join(';');
            history.pushState(active, '', newPath);
        },

        toggle: function() {
            var checked = $('input', this.el)[0].checked;
            this.model.toggle(checked);
        }
    });


    window.Opiate = Backbone.Model.extend({});

    window.OpiateList = Backbone.Collection.extend({
        model: window.Opiate
    });

    window.Opiates = new OpiateList;

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
            Opiates.bind('add', this.addImage);
            Subreddits.bind('add', this.addSubreddit);
        },

        addImage: function(opiate) {
            var view = new OpiateView({
                model: opiate,
                id: opiate.id
            });
            $('#opiates').append(view.render().el);
        },

        addSubreddit: function(subreddit) {
            var view = new SubredditView({
                model: subreddit
            });
            $('#options').append(view.render().el);
        }

    });


    var main = function() {
        var socket = new io.Socket();
        window.App = new Procrastinator;

        var subreddits = [];
        if (location.hash) {
            subreddits = location.hash.substr(1).split(';');
        }
        _.each(['pics', 'funny', 'comics', 'inglip'], function(item) {
            var checked = (subreddits.indexOf(item) >= 0);
            var subreddit = new Subreddit({
                'subreddit': item,
                'checked': checked
            });
            Subreddits.add(subreddit);
        });

        socket.on('connect', function(){ 
            console.log('connected');

            var active = Subreddits.active().map(function(item) {
                return item.get('subreddit');
            });
            socket.send(active);
        }) 
        socket.on('message', function(data){ 
            var opiate = new Opiate(data);
            Opiates.add(opiate);
        })
        socket.on('disconnect', function(){})
        socket.connect();
    }
    $(document).ready(main);
})();
