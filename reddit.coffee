Apricot = require 'apricot'
mime = require 'mime'
request = require 'request'
url = require 'url'
assert = require 'assert'

exports.Reddit = class
    @base_url:'http://www.reddit.com'

    @subreddits: {
        pics: '/r/pics.json'
    }

    constructor: (@subreddit) ->

        path = exports.Reddit.subreddits[@subreddit]
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
                    console.log "got back some activity"
                    body = JSON.parse body
                    parseTopic(body, cb)
        )

parseTopic = (body, cb) ->

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
    if uri.hostname.indexOf(url, 0) >= 0
        console.log("fixing #{imageUrl}")
        uri.path = uri.path + '.jpg'
        cb(url.format(uri))

    """
    Apricot.open url, (err, doc) ->
        if err?
            console.log err
            return
    """
