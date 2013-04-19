/**************************************************
** GAME KEYBOARD CLASS
**************************************************/
var Keys = function() {
		
	var onKeyPress = function(snake, e) {
        var temp = e.charCode;
        if(e.charCode > 96 && e.charCode < 123){
            temp -= 32;
        }
        if(!$('#message').is(':focus')){
            switch(temp){
                //W 87
                case 87:
                    console.log("Up");
                    //snake.turn(0);
                    snake.setTurnDir(0);
                    break;
                //D 68
                case 68:
                    console.log("Right " + snake.getTurnDir());
                    //snake.turn(1);
                    snake.setTurnDir(1);
                    break;
                //S 83
                case 83:
                    console.log("Down");
                    //snake.turn(2);
                    snake.setTurnDir(2);
                    break;
                //A 65
                case 65:
                    console.log("Left");
                    //snake.turn(3);
                    snake.setTurnDir(3);
                    break;
            }
        }
	};
	
	var onKeyUp = function(snake, e) {
        e = e || window.event;

        if(!$('#message').is(':focus')){
            switch(e.keyCode){
                //Up 38
                case 38:
                    snake.turn(0);
                    break;
                //Right 39
                case 39:
                    snake.turn(1);
                    break;
                //Down 40
                case 40:
                    snake.turn(2);
                    break;
                //Left 37
                case 37:
                    snake.turn(3);
                    break;
            }
        }
	};

	return {
		onKeyPress: onKeyPress,
		onKeyUp: onKeyUp
	};
};