"use strict";

const { NotFoundError } = require("../expressError");
const db = require("../db");
const bcrypt = require('bcrypt')

/** User of the site. */


class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(
      password, 12);
    const results = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
        [username, hashedPassword, first_name, last_name, phone]);
    return results.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */
  // TODO: Should we create the token here?
  // TODO: Should we throw an error here if a user is not found?

  static async authenticate(username, password) {
    const result = await db.query (
      `SELECT password
      FROM users
      WHERE username = $1`, [username]
    );
    const user = result.rows[0];

    return await bcrypt.compare(password, user.password) === true;
  }

  /** Update last_login_at for user */
  // TODO: Do we need to include a query to check if the user exists first?

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1`,
      [username]);
      const user = result.rows[0]

     // if (!user) throw new NotFoundError(`${username} not found`);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name
      FROM users`)
      const allUsers = result.rows;

      return allUsers;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, join_at, first_name, last_name, phone, last_login_at
      FROM users
      WHERE username = $1`, [username])
      const user = result.rows[0];
    
      if (!user) throw new NotFoundError(`${username} not found`);

      return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */
//TODO: double check this method
  static async messagesFrom(username) {
    const mResults = await db.query(
      `SELECT messages.id, 
          messages.to_username, 
          messages.body, 
          messages.sent_at, 
          messages.read_at,
          users.username, 
          users.first_name, 
          users.last_name, 
          users.phone
      FROM messages
      JOIN users ON messages.to_username = users.username
      WHERE from_username = $1`, [username])

      const messagesList = mResults.rows;//[{m1}, {m2}, {m3}]

      return  messagesList.map(message => {
        return {
          id : message.id,
          to_user : {
            username : message.username,
            first_name : message.first_name,
            last_name : message.last_name,
            phone : message.phone
          },
          body : message.body,
          sent_at : message.sent_at,
          read_at : message.read_at
        }
      })
      
    
  }

  // id SERIAL PRIMARY KEY,
  // from_username TEXT NOT NULL REFERENCES users,
  // to_username TEXT NOT NULL REFERENCES users,
  // body TEXT NOT NULL,
  // sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  // read_at TIMESTAMP WITH TIME ZONE);

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const mResults = await db.query(
      `SELECT messages.id, 
          messages.from_username, 
          messages.body, 
          messages.sent_at, 
          messages.read_at,
          users.username, 
          users.first_name, 
          users.last_name, 
          users.phone
      FROM messages
      JOIN users ON messages.from_username = users.username
      WHERE to_username = $1`, [username])

      const messagesList = mResults.rows;//[{m1}, {m2}, {m3}]

      return  messagesList.map(message => {
        return {
          id : message.id,
          from_user : {
            username : message.username,
            first_name : message.first_name,
            last_name : message.last_name,
            phone : message.phone
          },
          body : message.body,
          sent_at : message.sent_at,
          read_at : message.read_at
        }
      })
  }
}


module.exports = User;
