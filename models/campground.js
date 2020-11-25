var mongoose=require('mongoose');
var promise = mongoose.connect('mongodb://localhost/projectfinal', {
    useMongoClient: true});
var replySchema=new mongoose.Schema({
    text:String,
    author:String,
    authorid:String
});
var commentSchema=new mongoose.Schema({
    text:String,
    author:String,
    authorid:String,
    replies:[replySchema]
});
var campgroundschema=new mongoose.Schema({
    name:String,
    description:String,
    comments:[commentSchema],
    author:{
        id:String,
        username:String
    },
    likedusers:[String],
    likecount:{type:Number,default:0}
});
var Campground=mongoose.model("Campground",campgroundschema);
module.exports=Campground;