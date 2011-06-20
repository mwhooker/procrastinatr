jade = require 'jade'
less = require 'less'
express = require 'express'
io = require 'socket.io'
_ = require 'underscore'
redis = require 'redis'
reddit = require './reddit'

app = express.createServer(express.logger())

app.configure(() ->
    port = parseInt(process.env.PORT || 8000)
    app.set('port', port)
    app.set('socket.io transports', ['jsonp-polling'])
    staticDir = __dirname + '/static'
    app.use express.compiler(src: '/js', enable: ['coffeescript'])
    app.use express.compiler(src: staticDir, enable: ['less'])

    app.set('view engine', 'jade')
    app.set('views', __dirname + '/views')
    app.use(express.methodOverride())
    app.use(express.bodyParser())
    app.use(app.router)
    app.settings['view options'] = {
      og_debug: false
    }
)

app.configure('development', () ->
    app.use(express.static(__dirname + '/static'))
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))

    app.set('redis', {
        port: 6379
        host: 'localhost'
    })

    app.settings['view options']['host'] = 'http://localhost:' + app.set('port')
    app.settings['view options']['port'] = app.set('port')
    app.settings['view options']['og_debug'] = true
)

app.configure('production', () ->
    app.set('redis', {
        port: 9431
        host: 'bass.redistogo.com'
        auth: process.env.REDIS_AUTH
    })
    oneYear = 31557600000
    app.settings['view options']['host'] = 'http://omnigeist.com'
    app.settings['view options']['port'] = 80
    app.use(express.static(__dirname + '/static', { maxAge: oneYear }))
    app.use(express.errorHandler())

)

app.get "/", (req, res) ->
    res.render('index')


redisClient = redis.createClient(
    app.set('redis').port, app.set('redis').host)

if app.set('redis').auth
    redisClient.auth(app.set('redis').auth)

port = app.set('port')
console.log "Listening on port " + port
app.listen port

socket = io.listen(app)

socket.on('connection', (client) ->
    console.log 'connection'
    r = new reddit.Reddit('pics')
    r.get(null, (msg) ->
        client.send(msg))
    #client.on('message', (url) ->)
)
