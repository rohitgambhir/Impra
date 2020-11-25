var mongoose=require('mongoose');
var promise = mongoose.connect('mongodb://localhost/projectfinal', {
    useMongoClient: true});
var replySchema=new mongoose.Schema({
    text:String,
    author:String,
    authorid:String
});
var Reply=mongoose.model('Reply',replySchema);
module.exports=Reply;