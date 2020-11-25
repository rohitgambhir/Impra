var pageURL=$(location).attr("href");
for(i=pageURL.length-1;pageURL[i]!='/';i--);
i++;
var id=pageURL.substring(i,pageURL.length+1);
var likeurl="/campground/"+id+"/heartlike";
var dislikeurl="/campground/"+id+"/heartdislike";
$("#heart").hover(function(){
   $(this).toggleClass("hover");
});
var user;
$.post("/infoforheart",{},function(data){
    user=data;
});
//this case happens only if you are logged in
$("#heart").on("click",function(){
    $(this).fadeOut(function(){
        $("#filledheart").fadeIn(function(){
            $.post(likeurl,function(data){
                var innerhtml=(data.likecount-1)+" other users have also liked this";
                $("#hearttext").html(innerhtml);
                $("#hearttext").fadeOut(3000);
            })
        });
    });

});
//already clicked
$("#filledheart").on("click",function(){
   $(this).slideUp(function(){
      $("#heart").fadeIn(function(){
          $.post(dislikeurl,function(){
              //Dislike done,nothing required here..
          })
      });
   });
});
$("#nouserheart").mouseenter(function(){
    $(this).css("color","red");
});
$("#nouserheart").mouseleave(function(){
    $(this).css("color","black");
});