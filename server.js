var express        =require('express');
var bodyparser     =require('body-parser');
var mongoose       =require('mongoose');
var passport       =require('passport');
var LocalStrategy  =require('passport-local');
var Campground     =require('./models/campground.js');
var Comment        =require('./models/comment.js');
var Reply          =require('./models/reply.js');
var User           =require('./models/user.js');
var methodOverride =require('method-override');
var flash          =require('connect-flash');
var app=express();

var promise = mongoose.connect(process.env.DATABASEURL
    , {
        useMongoClient: true});
app.use(bodyparser.urlencoded({extended:true}));
var port=process.env.PORT;
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());

//Passport setup starts
app.use(require('express-session')({
    secret:"This statement is used to hash passwords",
    resave:false,
    saveUninitialized:false
}));
app.use(function(req,res,next){
    res.locals.error=req.flash('error');
    res.locals.success=req.flash('success');
    next();
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//Passport setup ends
//*********************


//Routes start

app.get("/",function(req,res){
    res.render("campground/landing.ejs",{currentUser:req.user});
    // res.render("campground/landing.ejs",{currentUser:req.user});
});
app.get("/campground",function(req,res) {
    Campground.find({},function(err,allCampgrounds){
        if(err)
        {
            console.log(err);
            console.log("Something went wrong");
        }
        else{
            res.render("campground/campground.ejs",{campground:allCampgrounds,currentUser:req.user});
        }
    });
});
function nl2br (str, isXhtml) {
    if (typeof str === 'undefined' || str === null) {
        return ''
    }
    var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br ' + '/>' : '<br>';
    return (str + '')
        .replace(/(\r\n|\n\r|\r|\n)/g, breakTag + '$1')
}
app.post("/campground",isLoggedIn,function(req,res){
    var name=req.body.name;
    var description=req.body.description;
    var author={
        id:req.user._id,
        username:req.user.username
    };
    var obj={name:name,description:description,author:author};
    Campground.create(obj,function(err,newlyCreated){
        if(err)
        {
            console.log(err);
            console.log("Could not be saved");
        }
        else{
            req.flash("success","Impro added successfully");
            res.redirect("/campground");   //default method is get for redirect
        }
    });
});
//Edit route
app.get("/campground/:id/edit",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,foundcampground){
        if(err){
            console.log(err);
            res.redirect("/campground");
        }
        else{
            if(foundcampground.author.id==req.user._id) {
                res.render("campground/edit.ejs", {campground: foundcampground, currentUser: req.user});
            }
            else{
                req.flash("error","You don't have permission to do that");
                res.redirect("/campground");
            }
        }
    });
});
app.put("/campground/:id",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,foundcampground){
        if(err){
            console.log(err);
            res.redirect("/campground");
        }
        else{
            if(foundcampground.author.id==req.user._id) {
                Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
                    if(err){
                        console.log(err);
                        res.redirect("/campground/"+req.params.id+"/edit");
                    }
                    else{
                        res.redirect("/campground/"+req.params.id);
                    }
                })
            }
            else{
                req.flash("error,You don't have permission to do that");
                res.redirect("/campground");
            }
        }
    });
});
//*************

//Delete Route
app.delete("/campground/:id",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,foundcampground){
        if(err){
            console.log(err);
            res.redirect("/campground");
        }
        else{
            if(foundcampground.author.id==req.user._id || req.user.username=="admin") {
                Campground.findByIdAndRemove(req.params.id,function(err){
                    if(err){
                        console.log(err);
                        res.redirect("/campground/"+req.params.id);
                    }
                    else{
                        res.redirect("/campground");
                    }
                })
            }
            else{
                req.flash("error","You don't have permission to do that");
                res.redirect("/campground");
            }
        }
    });
});
//***************

app.get("/campground/new",isLoggedIn,function(req,res){
    //will display the form to add a new campground
    res.render("campground/new.ejs",{currentUser:req.user});
});
app.get("/campground/:id",function(req,res){
    Campground.findById(req.params.id,function(err,foundcampground){
        if(err){
            console.log(err);
        }
        else
        {   var flag=0;
            if(req.user!=undefined){
                for(i=0;i<foundcampground.likedusers.length;i++){
                    if(req.user._id==foundcampground.likedusers[i]){
                        flag=1;
                        break;
                    }
                }
            }
            res.render("campground/show.ejs",{foundcampground:foundcampground,currentUser:req.user,flag:flag});
        }
    });
});
//Description route
app.post("/campground/:id/description",function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
            console.log("Some error occured")
        }
        else{
            var desc=nl2br(campground.description);
            res.send({desc:desc});
        }
    });
});

//Comment routes
app.post("/campground/:id/comments",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            res.redirect("/campground");
            req.flash("error","Something went wrong")
        }
        else{
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err);
                }
                else{
                    comment.authorid=req.user._id;
                    comment.author=req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campground/"+campground._id);
                }
            })

        }
    });
});
//************

//Reply Routes
app.post("/campground/:id/comments/:cid/:i",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            res.redirect("/campground");
            req.flash("error","Something went wrong")
        }
        else{
            Comment.findById(req.params.cid,function(err,comment){
                if(err){
                    res.redirect("/campground");
                    req.flash("error","Something went wrong")
                }
                else{
                    Reply.create(req.body.reply,function(err,reply){
                        if(err){
                            console.log(err);
                        }
                        else{
                            reply.authorid=req.user._id;
                            reply.author=req.user.username;
                            reply.save();
                            comment.replies.push(reply);
                            comment.save();
                            var i=req.params.i;
                            campground.comments[i].replies.push(reply);
                            campground.save();
                            res.redirect("/campground/"+campground._id);
                        }
                    })
                }
            })
        }
    })
});


//Auth Routes..
app.get("/register",function(req,res){
    res.render("users/register.ejs",{currentUser:req.user});
});
app.post("/register",function(req,res){
    var newUser=new User({
        username:req.body.username
    });
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message);
            res.redirect("/register");
        }
        else{
            //passport.authenticate is used to authenticate the info entered by the user to that in the database.
            //in this post request,we are first registering the user in the database
            //then when passport.authenticate is called then the registered user is logged in using the data stored in req
            //hence this method registers as well as logs in the user
            passport.authenticate("local")(req,res,function(){
                req.flash("success","Signed up successfully ! Welcome " + newUser.username +" :)");
                res.redirect("/campground");
            });
        }
    })
});
function isLoggedIn(req,res,next){  //This function is hoisted
    if(req.isAuthenticated()){
        return next();
    }
    else
    {
        req.flash("error","You need to be logged in first !");
        res.redirect("/login");
    }
}
app.get("/login",function(req,res){
    res.render("users/login.ejs",{currentUser:req.user});
});
var loginmiddleware={
    successRedirect:"/campground",
    failureRedirect:"/login"
};
app.post("/login",passport.authenticate("local",loginmiddleware),function(req,res){
    //This post request is of the form app.post("/login",middleware,callbackfunction)
    //Here callback function is doing nothing and can be removed also.
});
app.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged you out !!");
    res.redirect("/campground");
});

//HeartMeter Routes
app.post("/infoforheart",function(req,res){
    res.send({currentUser:req.user});
});
app.post("/campground/:id/heartlike",isLoggedIn,function(req,res){
    var likecount;
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }
        else{
            campground.likecount+=1;
            campground.likedusers.unshift(String(req.user._id));  //pushes to the start of the array
            likecount=campground.likecount;
            campground.save(function(err){
                if(err){
                    console.log(err);
                }
                else{
                    res.send({likecount:likecount});
                }
            })
        }
    });
});
app.post("/campground/:id/heartdislike",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }
        else{
            var id=req.user._id;
            campground.likecount-=1;
            var likecount=campground.likecount;
            var index=campground.likedusers.indexOf(id);
            if(index>-1){
                campground.likedusers.splice(index,1);
            }
            campground.save(function(err){
                if(err){
                    console.log(err)
                }
                else{
                    //Do nothing
                }
            });
        }
    })
});
app.listen(port,function(){
    console.log("Server is runnning");
});