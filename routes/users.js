"use strict";

const db = require("../db");
const User = require('../models/user');
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

const Router = require("express").Router;
const router = new Router();


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', ensureLoggedIn, async function (req, res, next){
  try{
    const result = await User.all();

    return res.json({users: result});
  }
  catch(err){
    return next(err);
  }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', ensureCorrectUser, async function (req, res, next){
  try{
    const username = req.params.username;
    const result = await User.get(username);

    return res.json({user: result});
  }
  catch(err){
    return next(err);
  }
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', ensureCorrectUser, async function (req, res, next){
  try {
    const username = req.params.username;
    const result = await User.messagesTo(username);

    return res.json({messages: result})
  }
  catch(er){
    return next(err);
  }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', ensureCorrectUser, async function (req, res, next){
  try {
    const username = req.params.username;
    const result = await User.messagesFrom(username);

    return res.json({messages: result})
  }
  catch(er){
    return next(err);
  }
})

module.exports = router;