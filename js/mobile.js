$(document).ready(function(){

    resizePage();
    $(window).bind('resize',resizePage);
});

function resizePage() {

    var width = $(window).width() - 5;
    var height = $(window).height();

    $('.container').css({
       width: width
    });

    if(width <= 320){
        $('.login').css({
            padding: "0px",
            margin: "0 auto",
            left: (width - $('.login').width()) / 2 - 2
        })

        $('.login h1').css({
            margin: "0px 0px 6px"
        })

        $('.return').css({
            margin: "5px"
        })

        $('.container').css({
            margin: "12px 0px 0px 2px"
        });

    }else{
        $('.login').css({
            padding: "20px 20px 20px",
            margin: "0 auto"
        })

        $('.login h1').css({
            margin: "-20px -20px 21px"
        })
    }
}