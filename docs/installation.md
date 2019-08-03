# Setting up a local installation

This document explains what you must do to start a local installation of Terminologue on your own computer for development or testing.

## A few things to understand first

Terminologue is web-based. This means that Terminologue runs on a server somewhere and people use their web browsers to access it through the Internet, just like any other website. In this document we explain how to set up Terminologue on your own computer, using your own computer as if it were a server, for development and testing.

Terminologue's backend (= the bits that run on the server) is written in [Node.js](https://nodejs.org/), which means the source code is (server-side) JavaScript and runs on pretty much any operating system, including GNU/Linux and Microsoft Windows. The only prerequisite is to install Node.js on your computer. All other prerequisites and dependencies will be detected and installed automatically by the Node.js Package Manager during set up.

For storing data on the server, including all the termbases, data about users and so on, Terminologue uses [SQLite](https://www.sqlite.org/). This dependency is managed by the Node.js Package Manager too. SQLite is file-based (= every database is just a file somewhere on your computer) which means that you don't need to install any database engines on your computer or anything like that.

## The steps

1. Install [Node.js](https://nodejs.org/) on your computer.

2. Download everything from the repository into a directory on your computer. You will notice that the stuff you have downloaded comes in several sub-directories, of which the most important are `data` (where Terminologue keeps its databases) and `website` (where the actual Terminologue website lives).

3. Using the terminal (if you're on GNU/Linux) or the command prompt (if you're on Microsoft Windows), go to the `website` sub-directory and run `npm install`. This will launch the Node.js Package Manager (NPM) which will download and install (into the `website/node_modules` directory) all dependencies needed by Terminologue. This may take a few minutes.

4. In the `website` sub-directory, rename the file `siteconfig.template.json` to `siteconfig.json`.

5. In the `data` sub-directory, rename the file `terminologue.template.sqlite` to `terminologue.sqlite`.

6. Back in the `website` sub-directory, run `node init.js`. This is a script which will create an account for you in your local installation of Terminologue. The script will tell you what your user name and password is. Remember this information or write it down.

7. Still in the `website` sub-directory, run `node terminologue.js`. This will start Terminologue's backend as a server on your computer. *Note: Terminologue is configured to run on port 80 by default. Some GNU/Linux installations consider this dangerous and will not allow it, unless you run Terminologue with elevated privileges. To run Terminologue with elevated privileges, run it as `sudo node terminologue.js` instead.*

8. Open your web browser and go to `http://localhost/`. You should see Terminologue's home page now and you should be able to log in using the user name and password from step 6.

Congratulations, you have a local installation of Terminologue running on your computer now. To end it at any time, press `Ctrl + C` in the terminal or command prompt.
