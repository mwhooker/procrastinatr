Apricot = require 'apricot'
mime = require 'mime'
request = require 'request'
url = require 'url'
assert = require 'assert'

exports.Reddit = class
    @base_url:'http://www.reddit.com'


    constructor: (@subreddit) ->

        path = "/r/#{@subreddit}.json"
        console.log path
        assert.ok(path,
            @subreddit + ' not found')

        @activity_url = url.parse exports.Reddit.base_url
        @activity_url.pathname = path

    get: (after, cb) ->

        #if after?

        uri = url.format(@activity_url)
        console.log "requesting activity from #{ uri }"

        request(
            uri: uri
            , (err, res, body) =>
                if err? or res.statusCode >= 400
                    console.log err
                else
                    body = JSON.parse body
                    console.log "got back some activity"
                    parseTopic(body, cb)
        )

parseTopic = (body, cb) ->

    if not body or not body.data
        console.log "no data returned"
        return

    console.log "found #{body.data.children.length} items"

    for i in body.data.children
        assert.ok i.kind == 't3'
        findImage(i.data.url, (image_url) ->
            i.data.image_url = image_url
            #console.log i
            cb(i.data)
        )

findImage = (imageUrl, cb) ->
    if mime.lookup(imageUrl).split('/')[0] == 'image'
        return cb(imageUrl)

    uri = url.parse(imageUrl)
    if uri.hostname.indexOf('imgur.com', 0) >= 0
        console.log("fixing #{imageUrl}")
        uri.pathname = uri.pathname + '.jpg'
        cb(url.format(uri))

    """
    Apricot.open url, (err, doc) ->
        if err?
            console.log err
            return
    """
