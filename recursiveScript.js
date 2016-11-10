    var coors = "";
    var lines = "";
    var route;
    var k = 0; //счетчик для добавления в будущий список 
    var count = 0; //счетчик для запросов

    // создание массива, в который динамически будет записываться информация для вывода в файл
    var MyBlobBuilder = function() {
        this.parts = [];
    }

    MyBlobBuilder.prototype.append = function(part) {
        this.parts.push(part);
        this.blob = undefined; // Invalidate the blob
    };

    MyBlobBuilder.prototype.getBlob = function() {
        if (!this.blob) {
            this.blob = new Blob(this.parts, {
                type: "text/plain"
            });
        }
        return this.blob;
    };

    var myBlobBuilder = new MyBlobBuilder();
    var d = new Date();
    myBlobBuilder.append("TIME : " + d.getHours().toString() + ":" + d.getMinutes().toString() + "\n");



    // считываем данные из файла, координаты точек графа
    window.onload = function() {
        var fileInput = document.getElementById('fileInput');
        var fileDisplayArea = document.getElementById('fileDisplayArea');

        fileInput.addEventListener('change', function(e) {
            var file = fileInput.files[0];
            var reader = new FileReader();

            reader.onload = function(e) {
                lines = reader.result.split("\n");

            workWithCoors(lines);

            }
            reader.readAsText(file);
        });
    }

    // инициализуруем объекты яндекс карт
    function workWithCoors(lines) {
        if (count === lines.length) {
            return;
        }

        coors = lines[count].split(" ");

        if (coors[1] == 43 || coors[2] == 43 || coors[1] == 201 || coors[2] == 201 || coors[1] == 251 || coors[2] == 251 || coors[1] == 42 || coors[2] == 42 || coors[1] == 38 || coors[2] == 38 || coors[1] == 45 || coors[2] == 45 || coors[1] == 252 || coors[2] == 252 || coors[1] == 199 || coors[2] == 199 || coors[1] == 142 || coors[2] == 142 || coors[1] == 11 || coors[2] == 11 || coors[1] == 21 || coors[2] == 21 || coors[1] == 79 || coors[2] == 79) {

            ymaps.ready(init);
        }else{
        
            ymaps.ready(init2); 
        }
    }

    // функция, считающая время переезда по ребру графа
    function init() {


        route = ymaps.route([


            [parseFloat(coors[3]), parseFloat(coors[4])], {
                type: 'wayPoint',
                point: [parseFloat(coors[5]), parseFloat(coors[6])]
            }


        ], {
            avoidTrafficJams: true
        }).then(
            function(route) {
                document.getElementById("result").value = route.getHumanJamsTime();

                myBlobBuilder.append(document.getElementById("result").value.split("&")[0] + "\n");
                k = k + 1;
                count++;
                workWithCoors(lines);
            }
        );

    }
 
    // функция, считающая время переезда по ребру графа
    function init2() {

        route = ymaps.route([


            [parseFloat(coors[3]), parseFloat(coors[4])], {
                type: 'wayPoint',
                point: [parseFloat(coors[5]), parseFloat(coors[6])]
            }
        ]).then(
            function(route) {
                document.getElementById("result").value = route.getHumanJamsTime();

                myBlobBuilder.append(document.getElementById("result").value.split("&")[0] + "\n");
                k = k + 1;
                count++;
                workWithCoors(lines);
            });
    }



    var urlOfTextFile = null;
    var create = document.getElementById('create');
    var textbox = document.getElementById('textbox');

    create.addEventListener('click', function() {
        var link = document.getElementById('downloadlink');
        link.href = makeUrlForTextFile();
        link.style.display = 'block';
    }, false);


    makeUrlForTextFile = function() {

        var data = myBlobBuilder.getBlob();



        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (urlOfTextFile !== null) {
            window.URL.revokeObjectURL(urlOfTextFile);
        }
        urlOfTextFile = window.URL.createObjectURL(data);
        return urlOfTextFile;
    };