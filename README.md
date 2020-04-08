# LHG Website Client & Server (Private)

As of 4/8/2020, the following are installed to make this functional:
* npm: 6.14.4
* nodejs: v12.16.1

The following npm modules are (or should be) used in the server:
* aws-sdk
* express
* concurrently
* nodemon

The following npm modules are (or should be) used in the client:
* react
* react-scripts
* react-router-dom
* kayn
* hashids
(Note: I could be missing a few...)

When you pull this repo, you will not have the npm modules. Those need to be installed yourself with "npm install <module>". Either that or the "package.json" should do it for you. 
- For training purposes, [I got everything setup by watching this video](https://www.youtube.com/watch?v=v0t42xBIYI)
- 

## Running the Server & Client

Run the following command lines in the root directory.

To get the server running only: (Server is running on Port 5000)
```sh
npm run server
```

To get the client running only: (Client is running on Port 3000)
```sh
npm run client
```

To run both server and client:
```sh
npm run dev
```

# Below this point is the automatic README.md generated by the create-react-app. 

I'll have to figure out how to use this completely... especially on the test cases.

```
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
```