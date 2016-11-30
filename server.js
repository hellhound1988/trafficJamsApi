#!/usr/bin/env node
var nodePersist = require('node-persist');
var express = require('express');
var path = require('path');
var fs = require('fs');
var http = require('http');
var jsdom = require("jsdom");
var app = express();

app.use(express.static(__dirname + "/"));

app.post("^/routes$", function (req, res) {
    res.writeHead(200);
    executeRequest(res);
});

nodePersist.initSync();

var html = '<html><head><script src="http://api-maps.yandex.ru/2.0/?load=package.standard,package.geoObjects,package.route&lang=ru-RU" type="text/javascript"></script></head><body></body></html>';
var doc = jsdom.jsdom(html, {
    features: {
        FetchExternalResources   : ['script'],
        ProcessExternalResources : ['script'],
        MutationEvents           : '2.0'
    }
});

var window = doc.defaultView;
window.onload = function() {
    window.ymaps.ready(function() {
        // configurable application port, defaults to 8081
        var proxyPort = process.env.PORT || 8081;
        var httpServer = http.createServer(app);
        httpServer.listen(proxyPort, function() {
            console.log('Listening to port ' + proxyPort + '...');
        });
    });
};

function executeRequest(res) {
    var lines = fs.readFileSync("input.txt", {encoding: "utf-8"}).split("\n");

    var counter;

    function appendRoute(index, text) {
        fs.appendFile("result.txt", "line " + index + ": " + text + "\n");
        counter++;
        if (counter == lines.length) {
            fs.appendFile("result.txt", "\n-----------------------------------\n");
            if (res) {
                res.end();
            }
        }
    }

    counter = 0;

    fs.appendFile("result.txt", new Date().toLocaleString() + "\n\n");
    lines.forEach(function (line, index) {
        getRoute(line).then(function(route) {
            appendRoute(index, route.getHumanJamsTime().split("&")[0]);
        }, function (error) {
            appendRoute(index, "Error: " + error.message);
        });
    });
}

/**
 *Функция отвечающая за возвращение маршрута
 *
 *@param {Array} line - Массив координат для ребра
 *
 *@return {Объект-Promise} при успешном построении преобразуется в Объект, описывающий маршрут
 */
function getRoute(line) {
    var coors = line.split(" ");

    if (coors[1] == 43 || coors[2] == 43 || coors[1] == 201 || coors[2] == 201 || coors[1] == 251 || coors[2] == 251 || coors[1] == 42 || coors[2] == 42 || coors[1] == 38 || coors[2] == 38 || coors[1] == 45 || coors[2] == 45 || coors[1] == 252 || coors[2] == 252 || coors[1] == 199 || coors[2] == 199 || coors[1] == 142 || coors[2] == 142 || coors[1] == 11 || coors[2] == 11 || coors[1] == 21 || coors[2] == 21 || coors[1] == 79 || coors[2] == 79) {
        return window.ymaps.route([
            [parseFloat(coors[3]), parseFloat(coors[4])], {
                type: 'wayPoint',
                point: [parseFloat(coors[5]), parseFloat(coors[6])]
            }


        ], {
            avoidTrafficJams: true
        })
    } else {
        return window.ymaps.route([


            [parseFloat(coors[3]), parseFloat(coors[4])], {
                type: 'wayPoint',
                point: [parseFloat(coors[5]), parseFloat(coors[6])]
            }
        ])
    }
}

