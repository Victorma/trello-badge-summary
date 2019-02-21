var express = require("express");
var request = require('request');

var app = express();

app.get("/api/:boardId", function(req, res) {

    var options = {
        url: 'https://api.trello.com/1/boards/' + req.params.boardId + '/lists?cards=open',
        method: 'GET',
        headers: {
            "accept": "application/json",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
        }
      };

    request(options, function (error, response, body) {

        if (error || !response) {
            res.status = 500;
            return res.send(JSON.stringify({ message: error }));
        }

        if (response.statusCode != 200) {
            res.status = response.statusCode;
            return res.send(JSON.stringify({ message: response.body }));
        }

        var counts = {};
        var boardData = JSON.parse(body);

        boardData.forEach(list => {
            counts[list.name] = list.cards.length;
        });

        if (req.query.show) {
            var filtered = {};
            var toShow = req.query.show.split(',');
            for (var i = 0; i < toShow.length; i++) {
                if (counts[toShow[i]]) {
                    filtered[toShow[i]] = counts[toShow[i]];
                }
            }
            counts = filtered;
        }
    
        if (req.query.hide) {
            var toHide = req.query.hide.split(',');
            for (var i = 0; i < toHide.length; i++) {
                if (counts[toHide[i]]) {
                    delete counts[toHide[i]];
                }
            }
        }
        
        var toJoin = [];

        for (var key in counts){
            toJoin.push(key + ': ' + counts[key]);
        }

        res.status = 200;
        return res.send(JSON.stringify({message: toJoin.join(', ')}));

    });
});


var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});
