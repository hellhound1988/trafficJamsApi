#!/usr/bin/env node
var express = require('express');
var fs = require('fs');
var http = require('http');
var jsdom = require("jsdom");
var app = express();

/**
 * Инициализация сервера Express для обработки http-запросов
 */

// статический контент
app.use(express.static(__dirname + "/"));

/**
 * @typedef {object} RouteInfo
 * @property {string} data - входные данные
 * @property {string} route - результат
 */

/**
 * GET /route?data=<data> - запрос маршрута с параметром
 * @return {RouteInfo}
 */
app.get("^/route$", function (req, res) {
    var line = req.query.data;
    if (line) {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        calculateRoute(line).then(function (route) {
            res.write(JSON.stringify(route));
            res.end();
        });
    } else {
        res.writeHead(400);
        res.write("'data' parameter is missing");
        res.end();
    }
});

/**
 * GET /routes - запрос всех маршрутов из input.txt
 * @return {[RouteInfo]}
 */
app.get("^/routes$", function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    calculateAllRoutes().then(function (routes) {
        res.write(JSON.stringify(routes));
        res.end();
    });
});

/**
 * Функции по работе с Yandex API
 */

/**
 * Получение маршрута по запрошенным данным
 */
function calculateRoute(data) {
    var promise = new Promise(function (resolve) {
        requestRoute(data, function (text) {
            resolve({
                data: data,
                route: text
            });
        });
    });
    return promise;
}

/**
 * Получение всех маршрутов по данным из input.txt
 */
function calculateAllRoutes() {
    var promise = new Promise(function (resolve) {
        var lines = fs.readFileSync("input.txt", {encoding: "utf-8"}).split("\n");

        var routes = new Array(lines.length);

        var counter;

        function appendRoute(index, text) {
            routes[index] = {
                data: lines[index],
                route: text
            };
            counter++;
            if (counter == lines.length) {
                resolve(routes);
            }
        }

        counter = 0;

        lines.forEach(function (line, index) {
            requestRoute(line, function (text) {
                appendRoute(index, text);
            });
        });
    });
    return promise;
}

function requestRoute(line, handler) {
    return getRoute(line).then(function(route) {
        return handler(route.getHumanJamsTime().split("&")[0]);
    }, function (error) {
        return handler("Error: " + error.message);
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

/**
 * Создание виртуального окна для yandex-карт, потому что yandex-карты не поддерживают работу в окружении NodeJS
 */

//виртуальный html
var html = '<html><head><script src="http://api-maps.yandex.ru/2.0/?load=package.standard,package.geoObjects,package.route&lang=ru-RU" type="text/javascript"></script></head><body></body></html>';
//виртуальный document
var doc = jsdom.jsdom(html, {
    features: {
        FetchExternalResources   : ['script'],
        ProcessExternalResources : ['script'],
        MutationEvents           : '2.0'
    }
});
//виртуальный window
var window = doc.defaultView;
window.onload = function() {
    window.ymaps.ready(function() {
        // configurable application port, defaults to 8081
        var proxyPort = process.env.PORT || 8081;
        var httpServer = http.createServer(app);

        //nodejs сервер стартует по готовности виртульного окна и yandex-карт
        httpServer.listen(proxyPort, function() {
            console.log('Listening to port ' + proxyPort + '...');
        });
    });
};

/**
 * -------------------------------------------------
 */

