
//quand la page s'affiche
window.onload = function(){

    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize = 30;
    var ctx;
    // 10 fois par seconde
    var delay = 100;
    //serpent
    var snakee;
    var applee;
    // =900/30
    var widthInBlocks = canvasWidth/blockSize;
    // =600/30
    var heightInBlocks = canvasHeight/blockSize;
    //score
    var score;
    //stocker le time out
    var timeout;

    init();

    function init(){
    var canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.border = "30px solid grey";
    canvas.style.margin = "50px auto";
    canvas.style.display = "block";
    canvas.style.backgroundColor = "#ddd";
    document.body.appendChild(canvas);
    //dessin en 2d
    ctx = canvas.getContext('2d');
    //creation de snakee
    snakee = new Snake([[6,4], [5,4], [4,4], [3,4], [2,4]], "right");
    //creation apple
    applee = new Apple([10,10]);
    //score
    score = 0;
    refreshCanvas();
    }
    
    //Fonction refresh
    function refreshCanvas(){

    snakee.advance();
    if(snakee.checkCollision()){
        //GAME OVER
        gameOver();
    }
    else{
        if(snakee.isEatingApple(applee)){
            score ++;
            snakee.ateApple = true;
            //Serpent a mangé la pomme
            do{
                applee.setNewPosition();
            }
            while(
                applee.isOnSnake(snakee));
            }
    
    //effacer une zone
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    //affiche le score
    drawScore();
    //a chaque refresh, dessiner le serpent
    snakee.draw();
    //a chaque refresh, dessiner la pomme
    applee.draw();
    timeout = setTimeout(refreshCanvas,delay);  
    }
}

    //fonction Game Over
    function gameOver(){
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        var centerX = canvasWidth / 2;
        var centerY = canvasHeight / 2;
        ctx.strokeText("Game Over", centerX, centerY -180);
        ctx.fillText("Game Over", centerX, centerY -180);
        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Appuyer sur la touche Espace pour rejouer", centerX, centerY -120);
        ctx.fillText("Appuyer sur la touche Espace pour rejouer", centerX, centerY -120);
        ctx.restore();
    }

    //fonction restart
    function restart(){
    //creation new snakee
    snakee = new Snake([[6,4], [5,4], [4,4], [3,4], [2,4]], "right");
    //creation new apple
    applee = new Apple([10,10]);
    score = 0;
    clearTimeout(timeout);
    refreshCanvas();
    }

    //fonction afficher le score a l'écran
    function drawScore(){
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "grey";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var centerX = canvasWidth / 2;
        var centerY = canvasHeight / 2;
        ctx.fillText(score.toString(), centerX, centerY);
        ctx.restore();
    }

    //dessiner
    function drawBlock(ctx, position){
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }

    //creation du serpent constructeur
    function Snake(body, direction){
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.draw = function(){
            //save le dessin
            ctx.save();
            //couleur du dessin
            ctx.fillStyle = "#ff0000";
            for(var i = 0; i < this.body.length; i++){
                drawBlock(ctx, this.body[i]);
            }
            //remettre comme il était avant
            ctx.restore();
        };

        //avancer le serpent
        this.advance = function(){
            // slice = copier l'élément
            var nextPosition = this.body[0].slice();
            switch(this.direction){
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw("invalid direction");
            }

            //rajouter la nexPosition, fonctionne que sur les arrays
            this.body.unshift(nextPosition);
            //"pop" permet de supprimer le dernier élément d'un array
            if(!this.ateApple)
            this.body.pop();
            else
            this.ateApple = false;
        };

        this.setDirection = function(newDirection){
            //les directions permisses
            var allowedDirections;
            switch(this.direction){
            case "left":
            case "right":
                allowedDirections = ["up", "down"];
                break;
            case "down":
            case "up":
                allowedDirections = ["left", "right"];
                break;
            default:
                throw("invalid direction");
            }
            //Si l'index de la nouvelle direction de l'array est sup à -1
            if(allowedDirections.indexOf(newDirection) > -1){
                //donc nouvelle permise
                this.direction = newDirection;
            }
        };

        //Vérifie si il y a collision
        this.checkCollision = function(){
            //1er cas Game over: le serpent sort du mur
            var wallCollision = false;
            //2 cas Game over: le serpent est passé sur son propre corps
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks - 1;
            var maxY = heightInBlocks - 1;
            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

            if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls){
                wallCollision = true;
            }

            //2e cas
            for(var i=0; i<rest.length; i++){
                if(snakeX === rest[i][0] && snakeY === rest[i][1]){
                    snakeCollision = true;
                }
            }
            return wallCollision ||  snakeCollision;
        };

        this.isEatingApple = function(appleToEat){
            var head = this.body[0];
            if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])     
                return true;          
            else
                return false;
        };
    }

    //create apple fonctin constructeur
    function Apple(position){

        this.position = position;
        this.draw = function(){
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            var radius = blockSize/2;
            var x = this.position[0]*blockSize + radius;
            var y = this.position[1]*blockSize + radius;
            ctx.arc(x, y, radius, 0, Math.PI*2, true);
            ctx.fill();
            ctx.restore();
        };

        this.setNewPosition = function(){
            var newX = Math.round(Math.random() * (widthInBlocks -1));
            var newY = Math.round(Math.random() * (heightInBlocks -1));
            this.position = [newX, newY];
        };
        this.isOnSnake = function(snakeToCheck){
            //la pomme n'est pas sur le serpent
            var isOnSnake = false;
            for(var i=0; i < snakeToCheck.body.length; i++){
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]){
                    isOnSnake = true;
                }
            }
            return isOnSnake;
        };
    }

    //quand l'utilisateur appuie sur son clavier
    document.onkeydown = function handleKeyDown(e){
        var key = e.keyCode;
        var newDirection;
        switch(key){
            case 37:
            newDirection = "left";
                break;
            case 38:
            newDirection = "up";
                break;
            case 39:
            newDirection = "right";
                break;
            case 40:
            newDirection = "down";
                break;
            case 32:
                restart();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    }
}