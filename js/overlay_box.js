var error;

$(document).ready(function(){

    $(window).bind('resize',showOverlayBox);
});

function openOverlay(err){
    error = err;
    showOverlayBox();
}

function showOverlayBox() {
    //if box is not set to open then don't do anything
    // set the properties of the overlay box, the left and top positions

    $('.overlayBox').css({
        display:'block',
        left:( $(window).width() - $('.overlayBox').width() ) / 2,
        top:( $(window).height() - $('.overlayBox').height() ) / 2 - 20,
        position: 'absolute'
    });

    $('#error').css({
        display: 'block',
        left: ( $('.overlayBox').width() - $('#error').width()) / 2 - 5,
        top: (  $('.overlayBox').height() - $('#error').height()) / 2 - 20,
        position: 'relative'
    });

    $('#error').html(error);

    $('.home').css("display", "block");

    // set the window background for the overlay. i.e the body becomes darker
    $('.bgCover').css({
        display:'block',
        width: $(window).width(),
        height:$(window).height()
    });
}