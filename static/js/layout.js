$(document).ready(function(){
    $('#navtab1, #navtab2, #navtab3, #navtab4').click(function(){
        //showing content1
        if(this.id == 'navtab1'){
            if ($('#view1').is(':hidden')){
                if($('#view2').is(':visible')){
                    $("#view2").hide();
                }else if($('#view3').is(':visible')){
                    $("#view3").hide();
                }else if($('#view4').is(':visible')){
                    $("#view4").hide();
                }
                $("#view1").fadeIn(600);
                $("#map-canvas").fadeIn(600);
            }
        }
        //showing content2
        else if(this.id == 'navtab2'){
            if ($('#view2').is(':hidden')){
                if($('#view1').is(':visible')){
                    $("#view1").hide();
                    $("#map-canvas").hide();
                }else if($('#view3').is(':visible')){
                    $("#view3").hide();
                }else if($('#view4').is(':visible')){
                    $("#view4").hide();
                }
                $("#view2").fadeIn(600);
            }
        }
        //showing content3
        else if(this.id == 'navtab3'){
            if ($('#view3').is(':hidden')){
                if($('#view1').is(':visible')){
                    $("#view1").hide();
                    $("#map-canvas").hide();
                }else if($('#view2').is(':visible')){
                    $("#view2").hide();
                }else if($('#view4').is(':visible')){
                    $("#view4").hide();
                }
                $("#view3").fadeIn(600);
            }
        }
        //showing content4
        else if(this.id == 'navtab4'){
            if ($('#view4').is(':hidden')){
                if($('#view1').is(':visible')){
                    $("#view1").hide();
                    $("#map-canvas").hide();
                }else if($('#view2').is(':visible')){
                    $("#view2").hide();
                }else if($('#view3').is(':visible')){
                    $("#view3").hide();
                }
                $("#view4").fadeIn(600);
            }
        }
    });
});