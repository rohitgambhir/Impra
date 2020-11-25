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
var Comment=mongoose.model('Comment',commentSchema);
module.exports=Comment;