var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs.connect('mongodb://isi', ['hashtags', 'tweets']);
var hashtags = [];

function init(resp) {
    db.hashtags.find(function(err, docs) {
        console.log(docs);
        if (err) {
            console.log("Error in retrieving the hashtags");
        } else {
            docs.forEach(function(elem) {
                hashtags.push(elem.hashtag);
            });
            if (resp != undefined) {
                resp.render('index', {
                    title: 'Express',
                    hashs: hashtags
                });
            }

        }
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
    if (hashtags.length == 0) {
        init(res);
    } else {
        res.render('index', {
            title: 'Express',
            hashs: hashtags
        });
    }
});

router.get('/refresh', function(req, res, next) {
    init(res);
});

router.get('/:hashtag', function(req, res, next) {
    if (hashtags.indexOf(req.params.hashtag) == -1) {
        res.render('error', {
            message: 'hashtag ' + req.params.hashtag + ' inexistant',
            error: {
                status: "oups !",
                stack: "Sorry..."
            },
            hashs: hashtags
        });
    } else {

        db.tweets.find({
            hashtags: req.params.hashtag
        }).sort({
            time: 1
        }, function(err, docs) {
            db.hashtags.find({
                hashtag: req.params.hashtag
            }, function(err2, res2) {
                res.render('main', {
                    tweets: docs,
                    current: res2[0]
                });
            });
        });
    }
});

module.exports = router;

init(undefined);
