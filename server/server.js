var express = require('express'),
    djms = require('djMS'),
    path = require('path'),
    app = express();

app.get('/dist/djPlayer.js', function(req, res){
    res.sendfile(path.resolve(__dirname + '/../dist/djPlayer.js'));
});
app.get('/css/djPlayer.css', function(req, res){
    res.sendfile(path.resolve(__dirname + '/../css/djPlayer.css'));
});

app.get('/bower_components/jquery-ui/jquery-ui.min.js', function(req, res){
    res.sendfile(path.resolve(__dirname + '/../bower_components/jquery-ui/jquery-ui.min.js'));
});
app.get('/bower_components/jqueryui-touch-punch/jquery.ui.touch-punch.min.js', function(req, res){
    res.sendfile(path.resolve(__dirname + '/../bower_components/jqueryui-touch-punch/jquery.ui.touch-punch.min.js'));
});



app.get('/list', function(req, res){
    var li = [__dirname+'/audio/test1.mp3', __dirname+'/audio/test2.mp3', __dirname+'/audio/test3.mp3', __dirname+'/audio/test4.mp3'];
    getList(0,li,[],function(d){
        res.jsonp(d);
    });

    function getList(cnt, li, rtn, callback){
        djms.getTag(li[cnt], function(err, tag){
            var d = {code: cnt+1, artist: tag.artist, title: tag.title, picture: tag.picture};
            rtn.push(d);
            if(cnt >= li.length-1){
                callback(rtn);
            }else{
                getList(cnt+1, li, rtn, callback);
            }
        });
    }
});

app.get('/music', function(req, res){
    var code = req.query.code;
    djms.pipe(req, res, __dirname+'/audio/test'+code+'.mp3');
});

app.get('/movie', function(req, res){
    var code = req.query.code;
    djms.pipe(req, res, __dirname+'/audio/test'+code+'.mp4');
});

app.get('/tag', function(req, res){
    var code = req.query.code;
    djms.getTag(__dirname+'/audio/test'+code+'.mp3', function(err, tag){
        res.jsonp(tag);
    });
});

var allowCORS = function(req, res, next) {
    res.header('Acess-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    (req.method === 'OPTIONS') ?
        res.send(200) :
        next();
};

// 이 부분은 app.use(router) 전에 추가하도록 하자
app.use(allowCORS);

app.listen(8888);