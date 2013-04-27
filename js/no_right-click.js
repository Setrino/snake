$(document).ready(function(){

    $('.404').load(function(){
        centerImage();
    });

    function centerImage(){

        var canvasWidth = parseInt($(window).width());
        var canvasHeight = parseInt($(window).height());

        var minRatio = Math.min(canvasWidth / $('.404').width(), canvasHeight / $('.404').height());
        var newImgWidth = minRatio * $('.404').width();
        var newImgHeight = minRatio * $('.404').height();

        var newImgX = (canvasWidth - newImgWidth) / 2;
        var newImgY = (canvasHeight - newImgHeight) / 2;

            $('.404').css({
                display:'block',
                left: newImgX,
                top: newImgY,
                width: newImgWidth,
                position:'absolute'
            });
    }

    $('img').bind('contextmenu', function(e) {
        return false;
    });

    $(window).bind('resize', centerImage);
});