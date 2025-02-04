//IMPORTS 
var express = require('express');
require('dotenv').config();
var cookieSession = require('cookie-session');
var Keygrip = require('keygrip');
const fetch = require("node-fetch");
const { PORT, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_SCOPE, FRONTEND_URL, KEY1, KEY2, DISCORD_GUILD_ID } = process.env;

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieSession({
    name:'heroSession',
    keys: new Keygrip([KEY1,KEY2],'SHA384','base64'),

    maxAge: 24*60*60*1000 //24 hours
}));


//ROUTS
app.use('/', indexRouter);

app.post('/getToken', async (req, res) =>{
    const tokenResponseData  = await fetch('https://discord.com/api/oauth2/token',
        {
            method:'POST',
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                code: req.body.code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.FRONTEND_URL,
                scope: DISCORD_SCOPE,
            }).toString(),
            headers:{
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
    const oauthData = await tokenResponseData.json();
    req.session.oauthData = oauthData;
    req.sessionOptions.maxAge = oauthData.expires_in;
    return res.json(oauthData)
});

app.get("/p/getMe", async (req, res) => {
    if(!req.session.oauthData){
        return res.json({error:'No Token'})
    }
    const authString = req.session.oauthData.access_token; 
    const token_type = req.session.oauthData.token_type; 
    if(!authString){
        console.log('NO access token');
        return res.json({error:'No Token'})
    }
    const me = await fetch('https://discord.com/api/users/@me/guilds/'+DISCORD_GUILD_ID+'/member',{
        headers: {
            'Authorization': token_type+' '+authString,
          },
    });

    const response = await me.json();
    const { avatar, banner, nick, roles, user, bio } = response;
    const profile = { avatar, banner, nick, roles, user, bio };
    req.session.profile = profile; 
    return res.json(profile)
  });

app.get("/login",async(req,res)=>{
    const red_uri = encodeURIComponent(FRONTEND_URL);
    const scope = DISCORD_SCOPE.replaceAll(' ','+');
    const redirect_url = 'https://discord.com/oauth2/authorize?client_id='+DISCORD_CLIENT_ID+'&response_type=code&redirect_uri='+red_uri +'&scope='+scope;
    res.redirect(redirect_url);
});  

app.get("/logout",async(req,res)=>{
    const authString = req.session.oauthData.access_token; 
    const token_type = req.session.oauthData.token_type; 
    const me = await fetch('https://discord.com/api/oauth2/token/revoke',{
        headers: {
            'Authorization': token_type+' '+authString,
          },
    });
	req.session=null;
    return res.redirect('/');
});  

app.get("/profile",async(req,res)=>{
    if(!req.session.oauthData){
        return res.json({error:'No Token'})
    } 
    if(!req.session.profile && !req.session.oauthData){
        return res.json({error:'No User'})
    }
    const{ avatar, banner, nick, roles, user, bio }= req.session.profile;
    const profile = { avatar, banner, nick, roles, user, bio }; 
    return res.json(profile)

});  
  

module.exports = app;
