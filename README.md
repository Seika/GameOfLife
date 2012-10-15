Game of Life in JavaScript
=
*By [Alejo Fernández][1]*

Overview
-
This is a sample implementation of Conway's Game Of Life cellular automata written in JavaScript language. The code was created having the following premises in mind:

 * Separate presentation from the game logic (i.e. allowing the reuse of the logic with a different user interface)
 * Avoid processing the cell sequentially
 * Showcase the use of different technologies: UI templating, Async programming, Code modularization, TDD, simple MVC pattern, code [linting][2]

High level design
-
The application was implemented following the MVC pattern. Due to the simplicity of the example I didn't use an existing MVC framework (Ember.js, Backbone.js, JavascriptMVC, etc.), nevertheless I decided to organize the code in different namespaces, classes and files for maintainability purposes.

### External libraries
The following external libraries were used to simplify the development of the application and showcase design patterns and technologies.

 * [Mediator.js](http://thejacklawson.com/Mediator.js/) to implement the Mediator pattern and simplify asynchronous programming.
 * [Prototype.js](http://http://prototypejs.org/) to enable Class support and utility functions for Arrays, Ranges and Enumerable objects.
 * [Namespace extension for Prototype](http://leahayes.wordpress.com/2010/01/19/prototypejs-extension-namespaces-for-javascript/) to enable namespacing support.
 * [Tempo.js](http://twigkit.github.com/tempo/) for HTML templating support.
 * [jQuery](http://jquery.org/) for DOM manipulation.
 * [Twitter Bootstrap](http://twitter.github.com/bootstrap/) for UI styling.
 * [JSHint](https://jshint.com/) for JavaScript code linting.
 * [QUnit](http://qunitjs.com/) for unit testing.

### Brief component description
#### Model
The model implements all the logic and rules of the Game Of Life. It consist in two classes `Grid` and `Cell` organized in the `GameOfLife.Model` namespace (/js/gridModel.js file).

The `Grid` class implements the logic for constructing the grid and handles the process of computing new generations. It exposes a method called `nextGeneration()` that publishes a notification to all the cells indicating that a new generation needs to be computed. 

The `Cell` class handles the state machine of a single cell, it also implements the rule to compute the cell status for the next generation. All cells are subscribed to the `nextGeneration` event published by the `Grid`, when they receive the message they compute the new status and if it differ from the previous status it notifies the `Grid` via the `cellUpdated` event. After that the `Grid` republishes the `cellUpdated` event to its subscribers (in this case the `GridController`).

#### Controller
The handles the interaction between the UI and the Model. It consist in a single class named `GridController` exported by the `GameOfLife.Controller` namespace (/js/gridController.js file).

The `GridController` class manages an instance of the `Grid` class and handles the flow of the application according to the user interaction.

#### View
The view is implemented in a single HTML file (GameOfLife.html), using HTML5 markup and visual styles provided by Twitter Bootstrap. The grid is created dynamically at startup using Tempo.js HTML templating library out of a JSON object containing the grid structure. After that, all the changes to the status of the cells are made through jQuery assigning dynamic css styles.

#### Tests
The classes `Grid` and `Cell` which implement the logic of the game were coded using test driven development with QUnit as unit testing framework.

### Online Demo
 * [Game Of Life]() demo
 * [Unit tests & code linter]()

  [1]: http://twitter.com/djseika
  [2]: http://en.wikipedia.org/wiki/Lint_%28software%29