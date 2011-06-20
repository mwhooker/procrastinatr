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
                    body = JSON.parse body
                    cb(RedditParser(body))
        )

class RedditParser

    constructor: (@body) ->
        console.log @body
