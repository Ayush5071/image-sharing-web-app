const express = require('express');
const router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local');
const bodyParser = require('body-parser'); // Importing body-parser middleware
const upload = require('./multer');
const postModel = require("./post")

// Configure body-parser middleware
router.use(bodyParser.urlencoded({ extended: true }));

passport.use(new localStrategy(userModel.authenticate()));

// GET home page
router.get('/', function(req, res, next) {
  res.render('index',{nav: false});
});

router.get('/profile', isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts");
  console.log(user)
  res.render('profile',{user,nav:true});
});

router.get('/register', function(req, res, next) {
  res.render('register',{nav:false});
});
router.get('/logout', (req, res, next) => { // No changes made in this part
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
// router.get('/google/callback',(req,res)=>{
//   res.send("done")
// })
//google authentication setup
router.get('/google',
  passport.authenticate('google', { scope: ['email','profile'] }));

  router.get('/auth/google/callback', isLoggedIn,
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect to profile
    res.redirect('/profile');
  }
);

router.get("/add",isLoggedIn,(req,res)=>{
  res.render('add',{nav:true})  
});

router.get("/posts/show", isLoggedIn,async (req,res)=>{
    const user = await userModel.findOne({username: req.session.passport.user}).populate("posts")
    res.render("show",{user,nav:true});
})
// POST request for registration
router.post('/register', (req, res, next) => {
  const data = {
    username: req.body.username, // Corrected to use req.body.username
    contact: req.body.contact,
    email: req.body.email,
    name: req.body.name
  };
  
  userModel.register(new userModel(data), req.body.password, (err, user) => {
    if (err) {
      console.error('Error registering user:', err);
      return res.redirect('/register'); // Redirect back to registration page in case of error
    }
    passport.authenticate("local")(req, res, () => {
      res.redirect('/profile');
    });
  });
});
router.get("/feed", isLoggedIn,async function(req, res,next){
    const user = await userModel.findOne({ username: req.session.passport.user });
    const posts = await postModel.find()
    console.log(posts)
    res.render("feed",{user,posts,nav:true});
});
//creating file upload route :
router.post('/fileupload',isLoggedIn,upload.single("image"),async (req,res,next)=>{
  const user = await userModel.findOne({username: req.session.passport.user}); //jab bhi aap logged in honge req.session.passport.user => username
  user.profileImage = req.file.filename; //jo bhi file upload hui hai wo iske andar save hota hai hamesha
  await user.save(); //kyuki hamne haath se changes kiye hai isliye hme save krna hoga
  res.redirect('/profile');

})

router.post('/login', passport.authenticate("local", { // No changes made in this part
  failureRedirect: '/',
  successRedirect: "/profile"
}), (req, res, next) => {});
router.post("/createpost",isLoggedIn,upload.single("postimage"),async (req,res)=>{  //upload.single("") isme name ayega input type file ka
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile")


})                            



function isLoggedIn(req, res, next) { // No changes made in this part
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = router;
