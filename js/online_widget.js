$(document).ready(function(){
	// This function is executed once the document is loaded
	// Caching the jQuery selectors:
	var count = $('.onlineWidget .count');
	var panel = $('.onlineWidget .panel');
	var open = false;

    checkOnline();
	
	$('.bottom_panel').click(
		function(){
			// Setting a custom 'open' event on the sliding panel:
            if(!open)
			panel.trigger('open');
            else
            panel.trigger('close');
		}
    ).click();
	
	var loaded=false;	// A flag which prevents multiple ajax calls to users_online.php;
	
	// Binding functions to custom events:
	
	panel.bind('open',function(){
        open = true;
        $('.arrow').css({
            "-webkit-transition": "-webkit-transform 0.2s ease-in-out",
            "-webkit-transform": "rotateZ(180deg)"
        });
		panel.slideDown(function(){
			if(!loaded)
			{
				// Loading the users data
				panel.load('../templates/users_online.php');
				loaded=true;
			}
		});
	}).bind('close',function(){
        open = false;
        $('.arrow').css("-webkit-transform","rotateZ(0deg)");
		panel.slideUp();
	});


    function checkOnline(){
        // Loading the number of users online into the count div:
        count.load("../templates/no_online.php");
        setTimeout(checkOnline, 30000);
    }

    /*
        function reposition(){

            $('.onlineWidget').css({
                left: $(window).width() * 0.85 - $('.onlineWidget').width()
            });
        }

        $(window).bind('resize', reposition);
    */
});