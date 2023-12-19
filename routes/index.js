var express = require('express');
var router = express.Router();
const userModel=require("./users");
const postModel=require("./post");
const passport= require('passport');
const localStrategy=require("passport-local");
const upload=require("./multer")
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// router.get('/createuser',async function(req, res, next) {
//   let createduser=await userModel.create({
//     username: "Harshit",
//     password: "1234",
//     post:[],

//     email: "harshit@gmail.com",
//     fullName: "Harshit Kumar Vishwakarma",
//   });
//   res.send(createduser);
// });
// router.get('/createpost',async function(req, res, next) {
//   let createdpost=await postModel.create({
//     postText:"Hello everyone kaise ho",
//     user:"6562e812cb3995d53eb9a8e9"
//   });
//   let user= await userModel.findOne({
//     _id:"6562e812cb3995d53eb9a8e9"
//   })
//   user.posts.push(createdpost._id);
  
//   await user.save();
//   res.send("done");
// });
// router.get('/alluserposts',async function(req,res,next){
//   let user=await userModel.findOne({
//     _id:"6562e812cb3995d53eb9a8e9"
//   }).populate('posts');;
//   res.send(user);
// })
router.post("/register",function(req,res,next){
const userdata=new userModel({
  username:req.body.username,
  email:req.body.email,
  fullname:req.body.fullname,
})// or use this
// const {username,email,fullname}=req.body;
// const userdata=new userModel({username,email,fullname});
userModel.register(userdata,req.body.password).then(function(registereduser){
  passport.authenticate("local")(req,res,function(){res.redirect("/profile")})
})
});
router.post("/login",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login",
  failureFlash:true,
}),function(req,res){

});
router.get('/login', function(req, res, next) {
  console.log(req.flash('error'));
  res.render('login',{error:req.flash('error')});
});
router.get('/feed', function(req, res, next) {
  res.render('feed');
});
router.post('/upload',isLoggedIn,upload.single("file"),async function(req, res, next) {
  if(!req.file)
  {
    return res.status(404).send('No files were uploaded');

  }
  const user=await userModel.findOne({username:req.session.passport.user});
 const  post= await postModel.create({
    image:req.file.filename,
    imageText:req.body.filecaption,
    user:user._id
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");

});
router.get("/logout",function(req,res){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/login');
  });
});
router.get("/profile",isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({
    username:req.session.passport.user
  }).populate("posts");
  res.render("profile",{user});
})
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login")
}
module.exports = router;
