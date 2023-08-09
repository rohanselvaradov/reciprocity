# reciprocity

## Table of contents
- [The plan](#the-plan)
    - [Users log in](#users-log-in)
    - [Users submit preferences](#users-submit-preferences)
    - [Users are matched](#users-are-matched)

## The plan

### Users log in
- Discord used for authentication
- Site needs to be secure
```
WHILE NOT authenticated:
    DO authenticate(user)
DO setup_user(user)
DO redirect(home)

sub setup_user(user):
    DO api_call(user)
    IF user NOT IN database:
        IF user IN target_guild:
            DO add_user_data(user)
        ELSE:
            DO redirect(error)
```

### Users submit preferences
- See other users and input preferences
  - Display all users with a guild in common
  - Checkboxes for each user
  - Submit to server

- Information transferred to server securely
  - Eventually use "single-bit of thousands" approach for privacy
  - Use cryptography to mutually agree on index of special bit for combination with each other user
    - **This part is shaky and needs more thought. How do *all* the pairs of users agree on a bit without the server knowing?**
  - Locally generate random bitstring except for special bit, which is a 1 or 0 depending on preference
  - Pass bitstrings to server and store in database section associated with user

### Users are matched
- Server finds mutual matches
  - Every time a new bitstring is submitted, AND it with all other sibling bitstrings
  - Store result in the database section associated with the user
  - Once user logs in, send all their stored results - or maybe only one (though we couldn't know if it's a match)
  - Results are interpreted and displayed locally
    - **This part is also shaky. How do we store all the indices of special bits?**


 ## TODO

### Upgrades
- Move over to MongoDB rather than JSON?
- Use discord.js??

 ### Important
- Decide whether to use ejs rather than sending HTML files assembled using JS

### Nice-to-have
- Make matches page look nicer
  - Deal with if user has no matches
- Bitstring approach to privacy
- When you try and visit a page that requires login, it redirects you to the login page and then **back to the page you were trying to visit**
  - Might do this with a ?redir= query parameter
- Logout with req.logout()
- Better handling on callback if OAuth fails (should redirect to home rather than just say "unauthorised")
- Deal with users leaving guilds (should no longer be able to log in)
- Allow user to decide whether or not to "keep me signed in"
- Refresh the session cookie so they stay logged in

### To roll out bigger
- Allow joining from any guild and only show users with mutual guild memberships

## Questions
- is it better to store user preferences as ["1", "2", "3"] (or integers), or as [true, true, true]
- is the method of storing prefs with IDs and then looking up the user when showing to clients clunky?
