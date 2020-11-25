var pageURL=$(location).attr("href");
for(i=pageURL.length-1;pageURL[i]!='/';i--);
i++;
var id=pageURL.substring(i,pageURL.length+1);
var descurl="/campground/"+id+"/description";
$.post(descurl,{},function(data){
    $("#content").html(data.desc);
});
