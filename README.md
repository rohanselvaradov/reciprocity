# reciprocity
## TODO

### From Uli
- it might be good to have more pure functions, separating the logic from file operations can be useful for testing & reasoning about code
  ==> in which places specifically? if you search for ` fs.` you can find the places doing file operations quite easily
- you should probably move the js in public to protected so the files that use each other are next to each other
  ==> I tried that before but it wasn't working, would that not require the server inserting the script inline to the HTML if it's not being served statically?
- the web UI could be improved css-wise
- you should probably be consistent between axios and fetch (axios being used once)
  ==> at the moment it is just fetch on client side and one axios request on server side to Discord API, is it worth changing that over to fetch?
- security
- it's probably good to allow people to select matches on the homepage rather than having to navigate to /preferences and /matches. you're close to a single page app already, might as well combine
- yeah you could use ejs instead of api requests clientside. clientside api reqs are more flexible long term though, you can do stuff without reloading, though for /matches it's currently kinda pointless
  ==> don't really understand this one

### Upgrades
- Move over to MongoDB rather than JSON?
- Use discord.js??

 ### Important
- Decide whether to use ejs rather than sending HTML files assembled using JS

### Nice-to-have
- Tell the user when they've submitted their preferences successfully
- Make matches page look nicer
  - Deal with if user has no matches
- Bitstring approach to privacy
#### Logging in
- When you try and visit a page that requires login, it redirects you to the login page and then **back to the page you were trying to visit**
  - Might do this with a ?redir= query parameter
- Better handling on callback if OAuth fails (maybe give a message)
- Deal with users leaving guilds (should no longer be able to log in)
- Allow user to decide whether or not to "keep me signed in"
- Refresh the session cookie so they stay logged in

### To roll out bigger
- Allow joining from any guild and only show users with mutual guild memberships

## Questions
- is it better to store user preferences as ["1", "2", "3"] (or integers), or as [true, true, true]
- is the method of storing prefs with IDs and then looking up the user when showing to clients clunky?

## Notes
The project file structure is as follows:
    
    ```
    protected/
        matches/
            index.html
        preferences/
            index.html
    public/
        matches/
            script.js
        preferences/
            script.js
    src/
        database/
            ...
        routes/
            ...
        strategies/
            ...
        utils/
            ...
    views/
        pages/
            ...
        partials/
            ...
    server.js
    ```