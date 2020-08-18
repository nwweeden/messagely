"use strict";

const { ensureLoggedIn } = require("../middleware/auth");
const { UnauthorizedError } = require("../expressError");
const  User = require('../models/user')
const { SECRET_KEY } = require('../config')
const jwt = require('jsonwebtoken')
const JWT_OPTIONS = { expiresIn: 60 * 60}

const Router = require("express").Router;
const router = new Router();

// TODO: is there a better error to throw?
/** POST /login: {username, password} => {token} */
router.post('/login', async function (req, res, next){
  try {
    const {username, password} = req.body;  
    const result = await User.authenticate(username, password);
    if(result){
      
      let payload = { username: username }
      let token = jwt.sign(payload, SECRET_KEY)
  
      return res.json({ token })
    }
    throw new UnauthorizedError('Invalid user/password')
  }
  catch(err){
    return next(err)
  }
})


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post('/register', async function (req, res, next){
  console.log('MADE IT!!')
  // console.log("REQUEST>BODY", req.body);
  try{
    const {username, password, first_name, last_name, phone} = req.body;
    const user = await User.register(username, password, first_name, last_name, phone)

    let payload = { username: user.username }
    let token = jwt.sign(payload, SECRET_KEY, JWT_OPTIONS)

    return res.json({ token })
  }
  catch(err) {
    return next(err);
  }
})

module.exports = router;