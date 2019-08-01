# Understanding Terminologue's source code

This document is a guided tour through Terminologue's code base. The goal is to help you understand how Terminologue works inside so that you can diagnose issues, fix bugs and help with developing Terminologue further.

## What awaits you inside

As you probably know by now, Terminologue's backend is written in Node.js, which means it's all server-side JavaScript. In addition to Node.js itself, Terminologue makes use of the Express framework. Express is a relatively simple, unopinionated framework which helps us to set up the various URL end-points on the server and which tells Node.js what should happen when a user hits one of those end-points. If you are familiar with Node.js and Express, you will find everything here very easy to understand. If you are not but if you do know some other web development technology, we think you will still be able to follow at least the principles of what we're saying in this document.

When Terminologue sends web pages to the client it formats them using a templating engine called EJS. The syntax of EJS is similar to ASP and ASP.NET: server-side code is surrounded by `<%` and `%>`, the rest is normal HTML.

The client-side bits of Terminologue are written in "almost pure" HTML, JavaScript and CSS. By "almost pure" we mean that we don't use any "all-inclusive" frameworks and that we don't use anything that would require post-processing or compilation before being served to the client. We do however use a set of client-side scripts and stylesheets called Screenful which gives us much of the client-side functionality. Most of the web pages the user sees in Terminologue are one-page applications: the web page is served to the browser and then, as the user interacts with various on-screen widgets, Screenful sends AJAX requests to the server and receives responses back from it. All data flowing between the client and sever is in JSON.

JSON is also the format in which data is stored internally in databases on the server. For backend storage Terminologue uses SQLite which is a file-based database engine. Every database in Terminologue is simply a file somewhere in the file system which SQLite opens and closes as and when it needs.

## `terminologue.js`

Terminologue's backend can be started (among other ways) by running `node terminologue.js` from the terminal or command prompt. The contents of the JavaScript file `terminologue.js` is interpreted and executed by Node.js. The file tells Node.js to do a couple of things:

1. It creates an *Express application object* called `app`.

2. It uses methods such as `app.post()` and `app.get()` to add to this object a large number of handlers for the various URL end-points that a user might hit. A handler is a JavaScript function which Node.js executes when an HTTP request arrives at the server. Usually, a handler somehow processes the data that came with the request and sends something back, for example a web page or a JSON object.

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

The file ops.js makes a large number of functions available. Pretty much all the functions are *asynchronous*: they don't return any values but, instead, they take a *callback function* as one of their arguments and, when they have done their work, they execute this callback to hand control back to the HTTP handler in `terminologue.js`. Passing callbacks around (instead of returning values) is how these things are done in Node.js.

When an `ops` function reads from or writes into an SQLite database, the database is usually represented there as an object called `db`, which arrived as an argument from a `terminologue.js` handler. This object has methods such as `db.run()` and `db.get()` which take SQL statements and execute them on the database. These methods are asynchronous too, and we return from them through callbacks. So, much of the server-side code in Terminologue has multiple levels of embedding callbacks inside callbacks inside more callbacks. Again, this is the normal pattern of doing things in Node.js.

This concludes our brief introduction to Terminologue's server-side code. We turn our attention to the client-side code now.

## Screenful
