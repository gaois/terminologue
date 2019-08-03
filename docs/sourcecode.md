# Understanding the source code

This document is a guided tour through Terminologue's code base. The goal is to help you understand how Terminologue works inside so that you can diagnose issues, fix bugs and help with developing Terminologue further.

## What awaits you inside

As you probably know by now, Terminologue's backend is written in [Node.js](https://nodejs.org/), which means it's all server-side JavaScript. In addition to Node.js itself, Terminologue makes use of the [Express](https://expressjs.com/) framework. Express is a small framework which helps us to set up the various URL end-points on the server and which tells Node.js what should happen when a user hits one of those end-points. If you are familiar with Node.js and Express, you will find everything here very easy to understand. If you are not but if you do know some other web development technology, we think you will still be able to follow at least the principles of what we're saying in this document.

When Terminologue sends web pages to the client it formats them using a templating engine called [EJS](https://ejs.co/). The syntax of EJS is similar to ASP and ASP.NET: server-side code is surrounded by `<%` and `%>`, the rest is normal HTML.

The client-side bits of Terminologue are written in "almost pure" HTML, JavaScript and CSS. By "almost pure" we mean that we don't use any "all-inclusive" frameworks and that we don't use anything that would require post-processing or compilation before being served to the client. We do however use a set of client-side scripts and stylesheets called [Screenful](https://github.com/michmech/screenful) which gives us much of the client-side functionality. Most of the web pages the user sees in Terminologue are one-page applications: the web page is served to the browser and then, as the user interacts with various on-screen widgets, Screenful sends AJAX requests to the server and receives responses back from it. All data flowing between the client and server is in JSON.

JSON is also the format in which data is stored internally in databases on the server. For backend storage Terminologue uses [SQLite](https://www.sqlite.org/index.html) which is a file-based database engine. Every database in Terminologue is simply a file somewhere in the file system which SQLite opens and closes as and when it needs.

## `terminologue.js`

Terminologue's backend can be started (among other ways) by running `node terminologue.js` from the terminal or command prompt. The contents of the JavaScript file `terminologue.js` is interpreted and executed by Node.js. The file tells Node.js to do a couple of things:

1. It creates an *Express application object* called `app`.

2. It uses methods such as `app.post()` and `app.get()` to add to this object a large number of handlers for the various URL end-points that a user might hit. A handler is a JavaScript function which Node.js executes when an HTTP request arrives at the server. Usually, a handler processes the data that came with the request and sends something back, for example a web page or a JSON object.

3. Finally, at the end of the file, it calls `app.listen()`. This tells Node.js to start listening for incoming HTTP requests. From this moment, each time a HTTP request arrives at the server which matches one of the end-points created in step 2 above, Node.js executes its handler. Node.js patiently keeps listening and executing handlers until the application is terminated.

Obviously, each handler is different, but they typically do things like:

- Read some data from the HTTP request by inspecting properties of the `req` object.

- Open a connection to a termbase (a termbase in Terminologue is an SQLite database) by calling `ops.getDB()`.

- Find out whether the client is logged in and has access to the termbase, by calling `ops.verifyLoginAndTermbaseAccess()` or something similar.

- Read or write some data from/into a termbase (= an SQLite database) by calling methods such as `ops.entryRead()`, `ops.entrySave()` and many others.

- Close the connection to an SQLite database by calling `db.close()`.

- Send a response to the client, either as a JSON object (by calling `res.json()`) or an HTML page. If the handler is sending an HTML page, it calls `res.render()`. This hands control over to the EJS templating engine which grabs one of the HTML templates in the `views` directory (the files have the extension `.ejs`), executes any server-side code in the template (= anything between `<%` and `%>`) and sends the result to the client.

## `ops.js`

Most handlers in `terminologue.js` call functions from the `ops` object, which is defined in the file `ops.js`. This file contains most of the low-level code which manipulates rows and columns in the databases. If we were using a separate database server instead of SQLite, most of this code would be in stored procedures. But we're using SQLite, and there is no such thing as stored procedures in SQLite, so we have `ops.js`.

The file `ops.js` makes a large number of functions available. Pretty much all the functions are *asynchronous*: they don't return any values but, instead, they take a *callback function* as one of their arguments and, when they have done their work, they execute this callback to hand control back to the HTTP handler in `terminologue.js`. Passing callbacks around (instead of returning values) is how these things are done in Node.js.

When an `ops` function reads from or writes into an SQLite database, the database is usually represented there as an object called `db`, which arrived as an argument from a `terminologue.js` handler. This object has methods such as `db.run()` and `db.get()` which take SQL statements and execute them on the database. These methods are asynchronous too, and we return from them through callbacks. So, much of the server-side code in Terminologue has multiple levels of embedding callbacks inside callbacks inside more callbacks. Again, this is the normal pattern of doing things in Node.js.

This concludes our brief introduction to Terminologue's server-side code. We turn our attention to the client-side code now.

## Screenful

All of the HTML pages we serve to the client are located in the `website/views` directory. Once the web page has arrived at the client's computer and has loaded in the client's web browser, we delegate most of the client-side functionality to the [Screenful](https://github.com/michmech/screenful) library.

Screenful gives us several **page types** which we make use of in Terminologue. For example:

- The `Screenful.Login` page type is a single-page application which takes care of the login process.

- The `Screenful.Make` page type is a single-page application which a user can interact with to create a new database. We use it on Terminologue to manage the process of creating a new termbase.

- The `Screenful.Navigator` page type is a single-page application with a list of entries on the left-hand side and a space for viewing and editing an entry on the right-hand side. Terminologue uses this page page type as its main termbase editing screen (the screen that terminologists spend most their time staring at).

- The `Screenful.Editor` page type is a single-page application where you can edit an individual entry. It comes with buttons for opening, saving, deleting and so. We use it on the right-hand side of the termbase editing screen (where it's embedded in an IFRAME) as well as in a couple of other places in Terminologue.

Each Terminologue web page declares which page type it is by including the relevant JavaScript and CSS files. For example, Terminologue's login page (`website/views/sitewide/login.ejs`) declares that it is a page of type `Screenful.Login` like this:

```html
<script type="text/javascript" src="../libs/screenful/screenful-login.js"></script>
<link type="text/css" rel="stylesheet" href="../libs/screenful/screenful-login.css" />
```

And then it supplies additional these parameters which tell Screenful (1) which URL it should send the login request to and (2) where it should redirect the user if the login is successful:

```html
<script type="text/javascript">
Screenful.Login.loginUrl="../login.json";
Screenful.Login.redirectUrl="<%=redirectUrl%>";
</script>
```

The AJAX request which Screenful sends from the client to our server, and the response our server sends back to the client, is documented in Screenful. For example, the client sends a request like this to `Screenful.Login.loginUrl`, telling us that the user `someone@example.com` wishes to log in:

```json
{
  "email": "someone@example.com",
  "password": "Hzwe86R!"
}
```

Our server may respond like this, which will prompt Screenful to redirect the user `Screenful.Login.redirectUrl`.

```json
{
  "success": true
}
```

Or our server may respond like this, which will prompt Screenful to tell the user that the log in has failed and give him or her a chance to try again:

```json
{
  "success": false
}
```

This is how Screenful works and this is how we use it everywhere in Terminologue, even for very complicated page types such as the termbase editing screen. We always declare that a particular web page is of a certain Screenful page type and then we make sure that we have end-points for the various server-side hookups which that page type needs.

Terminologue's copy of Screenful is located in `website/libs/screenful`. You should never edit anything in that directory. If you need to make changes to Screenful, consider sending a pull request to Screenful's [repository](https://github.com/michmech/screenful) instead.

## Editing the entries: `fy.js`

One of the most complicated chunks of client-side JavaScript code we have in Terminologue is the code that deals with editing an individual terminological entry. Its output is shown on the main editing screen, after the user clicks the *Edit* button, as a complex HTML form with tabs on top (DOM, TRM etc.).

This JavaScript code lives in the file `website/libs/fy/fy.js` and the HTML it outputs is formatted with a stylesheet in the file `website/libs/fy/fy.css`. It contains two main functions:

- `Fy.render()` which takes a terminological entry in JSON (which it has obtained from a termbase on the server) and renders it on screen as an HTML form which the user can then interact with. Pretty much all of the HTML you see on the right-hand side of the editing screen is the output of this function.

- `Fy.harvest()` which takes the current state of the HTML form and "harvests" it into a JSON object ready to be saved into a termbase on the server.

The functions `Fy.render()` and `Fy.harvest()` are called by Screenful (more specifically, by the `Screenful.Editor` page type) as and when the user has indicated (for example by clicking a button) that he or she wants to open an entry, save an entry and so on.

## Pretty-printing the entries

Another fairly complicated chunk of JavaScript code is the code that deals with formatting or "pretty-printing" the terminological entries. There are three places where that happens:

- On the left-hand side of the editing screen where entries are listed. Each entry is pretty-printed here in abbreviated form.

- On the right-hand side of the editing screen where an individual entry is pretty-printed in full form, with all details. The user can click the *Edit* button to switch between viewing the pretty-printed entry or editing it with `fy.js`.

- In the termbase's public interface (if the termbase is publicly visible) where entries are shown in their full form with all details, but with some minor differences from how they're shown in the editing interface.

This code lives in the `website/widgets` directory:

- `pretty-small.js` and `pretty-small.css` are for pretty-printing in the entry list on the left-hand side of the editing screen.

- `pretty-large.js` and `pretty-large.css` are for pretty-printing in on the right-hand side of the editing screen.

- `pretty-public.js` and `pretty-public.css` are for pretty-printing in the public interface of a termbase.

Each JavaScript file here contains a function called `entry()` which takes a terminological entry in JSON (which it has obtained from a termbase on the server) and outputs HTML. In `pretty-small.js` and `pretty-large.js`, the `entry()` function is executed client-side by Screenful every time it needs to render an entry on screen. In `pretty-public.js` the `entry()` function is executed client-side by Node.js and the output is sent to the client as part of a HTML page.

## Conclusion

OK, that's probably enough detail you need at this point. This document has hopefully given you a high-level overview of (1) Terminologue's server-side code and (2) some of the more complicated pieces of Terminologue's client-side code.
