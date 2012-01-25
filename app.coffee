jade = require 'jade'
less = require 'less'
express = require 'express'
io = require 'socket.io'
_ = require 'underscore'
reddit = require './reddit'

app = express.createServer(express.logger())
io = io.listen(app)

app.configure(() ->
    port = parseInt(process.env.PORT || 8000)
    app.set('port', port)
    staticDir = __dirname + '/static'
    app.use express.compiler(src: '/js', enable: ['coffeescript'])
    app.use express.compiler(src: staticDir, enable: ['less'])

    app.set('view engine', 'jade')
    app.set('views', __dirname + '/views')
    app.use(express.methodOverride())
    app.use(express.bodyParser())
    app.use(app.router)
    app.settings['view options'] = {
      p_debug: false
    }
)

app.configure('development', () ->
    app.use(express.static(__dirname + '/static'))
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))


    app.settings['view options']['host'] = 'http://localhost:' + app.set('port')
    app.settings['view options']['port'] = app.set('port')
    app.settings['view options']['p_debug'] = true
)

app.configure('production', () ->
    oneYear = 31557600000
    app.settings['view options']['host'] = 'http://omnigeist.com'
    app.settings['view options']['port'] = 80
    app.use(express.static(__dirname + '/static', { maxAge: oneYear }))
    app.use(express.errorHandler())

)

app.get "/", (req, res) ->
    res.render('index')


port = app.set('port')
console.log "Listening on port " + port
app.listen port

#socket = io.listen(app)

io.sockets.on('connection', (client) ->
    console.log 'connection'
    client.on('insufflate', (subreddits) ->
        console.log subreddits
        _.each subreddits, (subreddit) ->
            r = new reddit.Reddit(subreddit)
            r.get(null, (story) ->
                client.emit('story', story)
            )
    )
)
