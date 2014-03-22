status = new Image(16, 16);
status.src = "../images/preloader.gif";

$(document).ready(function(){

$("#username").change(function() { 

var usr = $("#username").val();

if(usr.length > 3)
{
    $("#status").html('<img src="../images/preloader.gif" align="absmiddle">&nbsp;Checking availability...');

    $.ajax({  
    type: "POST",  
    url: "../templates/check_user.php",
    data: "username="+ usr,  
    success: function(msg){  
   
   $("#status").ajaxComplete(function(event, request, settings){ 

	if(msg == 'OK')
	{ 
        $("#username").removeClass('object_error'); // if necessary
		$("#username").addClass("object_ok");
		$(this).html('&nbsp;<img src="../images/tick.gif" align="absmiddle">');
	}  
	else  
	{  
		$("#username").removeClass('object_ok'); // if necessary
		$("#username").addClass("object_error");
		$(this).html(msg);
	}    
   });
 }    
  }); 

}
else
	{
	$("#status").html('<span style="color: red">The username should have at least <strong>4</strong> characters.</span>');
	$("#username").removeClass('object_ok'); // if necessary
	$("#username").addClass("object_error");
	}

});

$("#password").change(function(){

    var password = $("#password").val();

    if(password.length > 7)
    {
    $("#status_p").html('Checking password state...');

    $.ajax({
        type: "POST",
        url: "../templates/check_user.php",
        data: "password="+ password,
        success: function(msg){

            $("#status_p").ajaxComplete(function(event, request, settings){

                if(msg == 'OK')
                {
                    $("#password").removeClass('object_error'); // if necessary
                    $("#password").addClass("object_ok");
                    $(this).html('&nbsp;<img src="../images/tick.gif" align="absmiddle">');
                }
                else
                {
                    $("#password").removeClass('object_ok'); // if necessary
                    $("#password").addClass("object_error");
                    $(this).html(msg);
                }
            });
        }
    });
}
    else
    {
        $("#status_p").html('<span style="color: red">The password should have at least <strong>8</strong> characters.</span>');
        $("#password").removeClass('object_ok'); // if necessary
        $("#password").addClass("object_error");
    }
});

$("#email").change(function() {

        var email = $("#email").val();

            $("#status_e").html('<img src="../images/preloader.gif" align="absmiddle">&nbsp;Checking availability...');

            $.ajax({
                type: "POST",
                url: "../templates/check_user.php",
                data: "email="+ email,
                success: function(msg){

                    $("#status_e").ajaxComplete(function(event, request, settings){

                        if(msg == 'OK')
                        {
                            $("#email").removeClass('object_error'); // if necessary
                            $("#email").addClass("object_ok");
                            $(this).html('&nbsp;<img src="../images/tick.gif" align="absmiddle">');
                        }
                        else
                        {
                            $("#email").removeClass('object_ok'); // if necessary
                            $("#email").addClass("object_error");
                            $(this).html(msg);
                        }
                    });
                }
            });
    });

    document.getElementById('reg_form').onsubmit = function(){

       if($("#status").html().indexOf("tick") !== -1
            && $("#status_p").html().indexOf("tick") !== -1
                && $("#status_e").html().indexOf("tick") !== -1){
           return true;
       }else{
            $("#status_r").html("The registration form is not complete").addClass("err").show().fadeOut(1000);
            return false; //allow the submission to go through
       }
    }
});