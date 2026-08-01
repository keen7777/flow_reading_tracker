# Flow Reading Tracker

Flow Reading Tracker is a browser-based Angular application designed to help language learners read unfamiliar and domain-specific texts more fluently.

The application aims to estimate the difficulty of a text based on the vocabulary already known by the user. Instead of assigning a general difficulty level to the entire text, it identifies potentially unfamiliar words from the user's perspective. This allows users to evaluate whether a text matches their current vocabulary level before or during reading.

While reading, users can highlight unfamiliar words directly in the text. The selected word is added to a personal vocabulary list, while its definition and the number of previous selections are displayed in a sidebar. This helps users look up and record technical or unfamiliar vocabulary without repeatedly interrupting the reading process.

## Current Features

* Import and read plain-text files in the browser
* Highlight unfamiliar words directly within a text
* View word definitions in a reading sidebar
* Track how often a word has been recorded
* Organize vocabulary by familiarity level
* Maintain separate vocabulary lists for different texts
* Browse imported text files
* Access texts that are currently being read
* Browse saved vocabulary lists
* Download vocabulary lists for external use
* Persist application data locally in the browser

## Application Areas

The application currently contains dedicated views for:

* the text-file library
* texts currently being read
* the reading interface
* the vocabulary-list directory
* individual vocabulary lists
* word definitions and statistics in the reading sidebar

## Technical Implementation

The application is built with Angular and TypeScript as a component-based single-page web application.

Angular services and Signals are used to manage reading data, vocabulary entries and derived application state. This enables components such as the reading view, sidebar and vocabulary directories to update reactively when users select or modify words.

Application data is currently stored locally in the browser, allowing the prototype to run without a separate backend.

## Project Status

Flow Reading Tracker is a locally runnable functional prototype. The main reading and vocabulary-management workflow has already been implemented.

Planned improvements include:

* reading-progress and history tracking
* automatic text-difficulty estimation based on the user's vocabulary
* further visual and usability improvements
* support for additional document formats beyond `.txt`
* expanded dictionary and vocabulary-management functionality
* additional automated tests

## Run Locally

```bash
npm install
npm start
```

After starting the development server, open the local address displayed in the terminal.


Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
