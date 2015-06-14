console.log('Hello');
var Twit = require('twit');
var twitter = require('twitter-text');
var async = require('async');
var T = new Twit({
    consumer_key: '',
    consumer_secret: '',
    access_token: '',
    access_token_secret: ''
});
var stream = T.stream('user');
var hashtags = [];
var mongojs = require('mongojs');
var db = mongojs.connect('mongodb://isi', ['hashtags', 'tweets']);
var blacklist = ['tbt', 'flash', 'abc', 'newsfromelsewhere', 'breakingnews', 'newscopter7', 'abc7ny', 'breaking'];

function init(callback) {
    db.hashtags.find(function(err, docs) {
        console.log(docs);
        if (err) {
            console.log("Error in retrieving the hashtags");
        } else {
            docs.forEach(function(elem) {
                console.log(elem);
                hashtags.push(elem.hashtag);
            });
        }
        callback();
    });
}

function main() {
    refresh();
    stream.on('tweet', function(tweet) {
        date = new Date();
        console.log(tweet.text);
        var currentHashtags = twitter.extractHashtags(tweet.text);
        if (currentHashtags.length > 0) {
            console.log('Présence de hashtags');
            currentHashtags.forEach(function(elem) {
                var hashtag = elem.toLowerCase();
                console.log("Pour " + hashtag);
                if ((hashtags.indexOf(hashtag) == -1) && (blacklist.indexOf(hashtag) == -1)) {
                    console.log(hashtag + "pas enregistré");
                    db.hashtags.save({
                        hashtag: hashtag,
                        time: date.getTime()
                    }, function(error, value) {
                        hashtags.push(hashtag);
                        console.log("Just added " + hashtag);
                        search_previous(hashtag);
                        refresh();
                    });
                }
            });
        }
    });
}

function refresh() {
    var global_stream;
    if (global_stream != undefined) {
        global_stream.stop();
    }
    global_stream = T.stream('statuses/filter', {
        track: '#' + hashtags.join(',#')
    });
    global_stream.on('tweet', function(tweet) {
        db.tweets.findOne({
            id: tweet.id_str
        }, function(error, res) {
            console.log("seen on stream " + tweet.text);
            if (!tweet.retweeted_status && res == null && !tweet.text.match(/(^| )RT @/)) {
                var record = {};
                date_tmp = new Date(tweet.created_at);
                record.coordinates = tweet.coordinates;
                record.id = tweet.id_str;
                record.verified = tweet.user.verified;
                tweetHashtags = twitter.extractHashtags(tweet.text);
                for (i = 0; i < tweetHashtags.length; i++) {
                    tweetHashtags[i] = tweetHashtags[i].toLowerCase();
                    if (tweetHashtags[i].match(/^ +$/)) {
                        tweetHashtags.splice(i, 1);
                        i--;
                    }
                }
                record.hashtags = tweetHashtags;
                record.time = date_tmp.getTime();
                db.tweets.save(record);
                console.log("Added after streaming " + tweet.text);
            }
        });
    });
}

function search_previous(hashtag) {
    T.get('search/tweets', {
        q: '#' + hashtag,
        count: 100
    }, function(err, data, response) {
        data.statuses.forEach(function(tweet) {
            console.log('pour ' + tweet.text);
            db.tweets.findOne({
                id: tweet.id_str
            }, function(error, res) {
                if (!tweet.retweeted_status && res == null && !tweet.text.match(/(^| )RT @/)) {
                    console.log('dedans');
                    var record = {};
                    date_tmp = new Date(tweet.created_at);
                    record.coordinates = tweet.coordinates;
                    record.id = tweet.id_str;
                    tweetHashtags = twitter.extractHashtags(tweet.text);
                    for (i = 0; i < tweetHashtags.length; i++) {
                        tweetHashtags[i] = tweetHashtags[i].toLowerCase();
                        if (tweetHashtags[i].match(/^ +$/)) {
                            tweetHashtags.splice(i, 1);
                            i--;
                        }
                    }
                    record.hashtags = tweetHashtags;
                    record.verified = tweet.user.verified;
                    record.time = date_tmp.getTime();
                    db.tweets.save(record);
                    console.log("Added after searching " + tweet.text);
                }
            });
        });
    });
}

init(main);

