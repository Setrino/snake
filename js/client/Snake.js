/**************************************************
 ** LOCAL PLAYER CLASS
 **************************************************/
function Snake(nick, size, orgX, orgY, orgDir, color, ai, number, team){

    this.keypressed = false,
        this.nick = nick,
        this.step = 0,
        this.sweets = 0,
        this.alive = true,
        this.color = color,
        this.size = size,
        this.orgX = orgX,
        this.orgY = orgY,
        this.snakeA = [],
        this.orgDir = orgDir,
        this.turnDir = orgDir,
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
Snake.prototype.update = function(that, grid){

    console.log("Turn " + that.step + " time " + new Date().getSeconds() + "." +  new Date().getUTCMilliseconds());

    var prev = [that.snakeA[0][0], that.snakeA[0][1], that.snakeA[0][2]];

    //Left, Top is (0,0)
    switch(that.snakeA[0][2]){

        case 0:
            that.snakeA[0][1] -=1;
            break;
        case 1:
            that.snakeA[0][0] +=1;
            break;
        case 2:
            that.snakeA[0][1] +=1;
            break;
        case 3:
            that.snakeA[0][0] -=1;
            break;
    }

    //snake[0][0] - the x-axis value, grid[0].length - number of columns, so x
    //snake[0][1] - the y-axis value, grid.length - number of rows, so y
    if(that.snakeA[0][0] < 0){
        that.snakeA[0][0] +=1;
        that.alive = false;}
    if(that.snakeA[0][0] >= grid[0].length){
        that.snakeA[0][0] -=1;
        that.alive = false;
    }
    if(that.snakeA[0][1] >= grid.length){
        that.snakeA[0][1] -=1;
        that.alive = false;
    }
    if(that.snakeA[0][1] < 0){
        that.snakeA[0][1] +=1;
        that.alive = false;
    }

    if(!that.alive){
        that.died();
    }

    if(that.step != 0){
        for(var i = 1; i < that.snakeA.length; i++){
            var temp = [that.snakeA[i][0], that.snakeA[i][1], that.snakeA[i][2]];


            //-------- If snake falls on itself - die -------//

            if(that.snakeA[0][0] == that.snakeA[i][0] && that.snakeA[0][1] == that.snakeA[i][1]){
                that.died();
            }
            that.snakeA[i][0] = prev[0];
            that.snakeA[i][1] = prev[1];
            that.snakeA[i][2] = prev[2];
            prev = temp.slice();
        }
    }

    try{
        value = grid[that.snakeA[0][1]][that.snakeA[0][0]];
    }catch(err){
        console.log("Snake at " + that.snakeA[0][1] + " " + that.snakeA[0][0]);
        console.log("Grid size " + grid.length + " " + grid[0].length);
    }

    if(grid[that.snakeA[0][1]][that.snakeA[0][0]] == 2){
        console.log("DIED");
    }

    if(value != 0){

        switch(value){
            case 1:
                that.sweets++;
                ate = true;
                that.add();
                grid[that.snakeA[0][1]][that.snakeA[0][0]] = 0;
                that.toGrid();
                break;
            case 2:
                that.died();
                break;
            /*default:
             if(value.indexOf('_') != -1){
             console.log("COOL");
             getSnakeInstance(value.substring(0, value.indexOf('_'))).died();
             that.died();
             }else{
             that.died();
             }
             break;*/
        }
    }else{
        that.toGrid();
    }
    that.keypressed = false;
}

//Using keystroke turn the snake
Snake.prototype.turn = function(grid, callback){

    if(this.keypressed == false){
        if(this.turnDir != this.snakeA[0][2] && (this.turnDir + 2) % 4 != this.snakeA[0][2]){
            this.snakeA[0][2] = this.turnDir;
            console.log(this.turnDir);
        }
    }
    this.keypressed = true;
    callback(this, grid);
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
Snake.prototype.getNick = function() {
    return this.nick;
};

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

Snake.prototype.setTurnDir = function(turnDir) {
    this.turnDir = turnDir;
};

Snake.prototype.getTurnDir = function() {
    return this.turnDir;
};

Snake.prototype.setAlive = function(alive) {
    this.alive = alive;
};

Snake.prototype.getAlive = function() {
    return this.alive;
};