"use strict";

const Router = require("express").Router;
const router = new Router();
const Message = require('../models/message')
const { ensureLoggedIn, ensureCorrectUser, authenticateJWT } = require("../middleware/auth");
const { UnauthorizedError } = require("../expressError");


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async function (req, res, next){
  try{
    const id = req.params.id;
    const result = await Message.get(id);
    if (result.from_user.username === res.locals.user.username ||
        result.to_user.username === res.locals.user.username){
          return res.json({user: result});
        }
    throw new UnauthorizedError()
  }
  catch(err){
    return next(err);
  }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', authenticateJWT, async function (req, res, next){
  try{
    const {to_username, body} = req.body;
    // console.log("USERNAME IS", res.locals.user.username)
    const from_username = res.locals.user.username;
    const result = await Message.create({ from_username, to_username, body })
    
    return res.json({message: result});
  }
  catch(err){
    return next(err);
  }
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureCorrectUser, async function (req, res, next){
  try{
    const id = req.params.id;
    const result = await Message.markRead(id)
    
    return res.json({message: result});
  }
  catch(err){
    return next(err);
  }
})


module.exports = router;