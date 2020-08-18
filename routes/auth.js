"use strict";

const { ensureLoggedIn } = require("../middleware/auth");
const { UnauthorizedError, BadRequestError } = require("../expressError");
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
      User.updateLoginTimestamp(username)
      let payload = { username: username }
      let token = jwt.sign(payload, SECRET_KEY)
      
      return res.json({ token })
    }
    throw new BadRequestError()
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
  try{
    const {username, password, first_name, last_name, phone} = req.body;
    const user = await User.register({username, password, first_name, last_name, phone})
    User.updateLoginTimestamp(username)
    let payload = { username: user.username }
    let token = jwt.sign(payload, SECRET_KEY)

    return res.json({ token })
  }
  catch(err) {
    return next(err);
  }
})
//TODO:update login
module.exports = router;