"use strict";

const { NotFoundError } = require("./expressError");

/** User of the site. */


class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const results = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone)
      VALUES $1, $2, $3, $4, $5
      RETURNING username, password, first_name, last_name, phone`,
        [username, password, first_name, last_name, phone]);
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
      SET last_login_at = CURRENT_TIMESTAMP()
      WHERE username = $1`,
      [username]);
      const user = result.rows[0]

      if (!user) throw new NotFoundError(`${username} not found`);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, password, first_name, last_name, phone, last_login_at
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
      `SELECT username, password, first_name, last_name, phone, last_login_at
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

  static async messagesFrom(username) {
    const mResults = await db.query(
      `SELECT id, to_user, body, sent_at, read_at
      FROM messages
      WHERE from_username = $1`, [username])
      const messages = mResults.rows;

    const uResults = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users
      WHERE id = $1`, [username])
      const user = uResults.rows[0]

      user.messages = messages
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
  }
}


module.exports = User;
