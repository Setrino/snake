/**************************************************
 ** LOCAL PLAYER CLASS
 **************************************************/
function Snake(size, orgX, orgY, orgDir, color, ai, number, team){

    this.keypressed = false,
        this.step = 0,
        this.sweets = 0,
        this.alive = true,
        this.color = color,
        this.size = size,
        this.orgX = orgX,
        this.orgY = orgY,
        this.orgDir = orgDir,
        this.snakeA = [],
        this.ai = ai,
        this.number = number,
        this.team = team,
        this.id,
        this.grid;

    this.init();
}

//OriginalX, Original Y, OriginalDirection (n = 0, e = 1, s = 2, w = 3)
Snake.prototype.init = function(){

    for(var i = 0; i < this.size; i++)
        this.snakeA.push([this.orgX, this.orgY, this.orgDir]);
}

Snake.prototype.died = function(){

    this.number = 2;
    this.color = "#000";
    this.alive = false;
    this.toGrid();
}

//Main snake logic. KeyStroke recognition, Sending data, Receiving data
Snake.prototype.update = function(grid){

    console.log("Turn " + this.step + " time " + new Date().getSeconds() + "." +  new Date().getUTCMilliseconds());

    var prev = [this.snakeA[0][0], this.snakeA[0][1], this.snakeA[0][2]];

    //Left, Top is (0,0)
    switch(this.snakeA[0][2]){

        case 0:
            this.snakeA[0][1] -=1;
            break;
        case 1:
            this.snakeA[0][0] +=1;
            break;
        case 2:
            this.snakeA[0][1] +=1;
            break;
        case 3:
            this.snakeA[0][0] -=1;
            break;
    }

    if(this.snakeA[0][0] < 0){
        alert("X");
        this.snakeA[0][0] = 0;
    }
    if(this.snakeA[0][1] < 0){
        this.snakeA[0][1] = 0;
        alert("Y");
    }

    if(this.step != 0){
        for(var i = 1; i < this.snakeA.length; i++){
            var temp = [this.snakeA[i][0], this.snakeA[i][1], this.snakeA[i][2]];


            //-------- If snake falls on itself - die -------//

            if(this.snakeA[0][0] == this.snakeA[i][0] && this.snakeA[0][1] == this.snakeA[i][1]){
                //this.died();
            }
            this.snakeA[i][0] = prev[0];
            this.snakeA[i][1] = prev[1];
            this.snakeA[i][2] = prev[2];
            prev = temp.slice();
        }
    }

    try{
        value = grid[this.snakeA[0][1]][this.snakeA[0][0]];
    }catch(err){
        console.log("Snake at " + this.snakeA[0][1] + " " + this.snakeA[0][0]);
        console.log("Grid size " + grid.length + " " + grid[0].length);
    }

    if(grid[this.snakeA[0][1]][this.snakeA[0][0]] == 2){
        console.log("DIED");
    }

    if(value != 0){

        switch(value){
            case 1:
                this.sweets++;
                ate = true;
                this.add();
                grid[this.snakeA[0][1]][this.snakeA[0][0]] = 0;
                this.toGrid();
                break;
            case 2:
                this.died();
                break;
            /*default:
             if(value.indexOf('_') != -1){
             console.log("COOL");
             getSnakeInstance(value.substring(0, value.indexOf('_'))).died();
             this.died();
             }else{
             this.died();
             }
             break;*/
        }
    }else{
        this.toGrid();
    }
    this.keypressed = false;
}

//Using keystroke turn the snake
Snake.prototype.turn = function(turnDir){

    if(this.keypressed == false){
        if(turnDir != this.snakeA[0][2] && (turnDir + 2) % 4 != this.snakeA[0][2]){
            this.snakeA[0][2] = turnDir;
            console.log(turnDir);
        }
    }
    this.keypressed = true;
}

//Adds one extra block for the snake
Snake.prototype.add = function(){

    tail = this.snakeA.length - 1;

    switch(this.snakeA[tail][2]){
        case 0:
            this.snakeA.push([this.snakeA[tail][0], this.snakeA[tail][1] + 1, 0]);
            break;
        case 1:
            this.snakeA.push([this.snakeA[tail][0] - 1, this.snakeA[tail][1], 0]);
            break;
        case 2:
            this.snakeA.push([this.snakeA[tail][0], this.snakeA[tail][1] - 1, 0]);
            break;
        case 3:
            this.snakeA.push([this.snakeA[tail][0] + 1, this.snakeA[tail][1], 0]);
            break;
    }
}

//Add the snake to grid
Snake.prototype.toGrid = function(){

    if(this.alive){
        grid[this.snakeA[0][1]][this.snakeA[0][0]] = this.number + "_";
        for(var i = 1; i < this.snakeA.length; i++){
            grid[this.snakeA[i][1]][this.snakeA[i][0]] = this.number;
        }
    }else{
        for(var i = 0; i < this.snakeA.length; i++){
            grid[this.snakeA[i][1]][this.snakeA[i][0]] = this.number;
        }
    }
}

//Draw snake on canvas and upgrade the grid position if the snake has died.
Snake.prototype.draw = function(ctx){

    //console.log("Val " + this.snakeA[0][1] + " color " + this.color);

    ctx.fillStyle = this.color;

    for(var i = 0; i < this.snakeA.length; i++){
        ctx.fillRect(this.snakeA[i][0] * dim, this.snakeA[i][1] * dim, dim, dim);
    }

    ctx.strokeStyle = "#000";
    qDim = dim / 4;
    tDim = dim / 10;
    var x;
    var y;

    //20 + 6, 40 + 15
    if(this.snakeA[0][2] == 0){
        x = this.snakeA[0][0] * dim + qDim + 1;
        y = this.snakeA[0][1] * dim + qDim;
    }else if(this.snakeA[0][2] == 1){
        x = this.snakeA[0][0] * dim + 3 * qDim;
        y = this.snakeA[0][1] * dim + qDim + 1;
    }else if(this.snakeA[0][2] == 2){
        x = this.snakeA[0][0] * dim + qDim + 1;
        y = this.snakeA[0][1] * dim +  3 * qDim;
    }else if(this.snakeA[0][2] == 3){
        x = this.snakeA[0][0] * dim + qDim;
        y = this.snakeA[0][1] * dim + qDim + 1;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, tDim, 0, Math.PI * 2, false);
    ctx.stroke();
    if(x == this.snakeA[0][0] * dim + qDim + 1){
        ctx.moveTo(x + qDim + 2, y);
        ctx.arc(x + qDim + 2, y, tDim, 0, Math.PI * 2, false);
    }else if(y == this.snakeA[0][1] * dim + qDim + 1){
        ctx.moveTo(x, y + qDim + 2);
        ctx.arc(x, y + qDim + 2, tDim, 0, Math.PI * 2, false);
    }
    ctx.stroke();
    ctx.closePath();
}

// Getters and setters
Snake.prototype.getSize = function() {
    return this.size;
};

Snake.prototype.getDir = function() {
    return this.snakeA[0][2];
};

Snake.prototype.getColor = function() {
    return this.color;
};

Snake.prototype.setDir = function(newDir){
    this.snakeA[0][2] = newDir;
}

Snake.prototype.getAi = function() {
    return this.ai;
};

Snake.prototype.getNumber = function() {
    return this.number;
};

Snake.prototype.getTeam = function(){
    return this.team;
};

Snake.prototype.getStep = function(){
    return this.step;
};

Snake.prototype.stepUp = function(){
    this.step++;
}

Snake.prototype.setStep = function(newStep){
    //console.log("LocalStep " + newStep);
    this.step = newStep;
}

Snake.prototype.getX = function() {
    return this.snakeA[0][0];
};

Snake.prototype.getY = function() {
    return this.snakeA[0][1];
};

Snake.prototype.setX = function(newX) {
    this.snakeA[0][0] = newX;
};

Snake.prototype.setY = function(newY) {
    this.snakeA[0][1] = newY;
};

Snake.prototype.getArray = function() {
    return this.snakeA;
};

Snake.prototype.setArray = function(newArray) {
    this.snakeA = newArray.slice();
};