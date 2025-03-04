// babel.config.js
module.exports = {
  presets: [
    "@babel/preset-env", // To transpile ES6+ syntax
    "@babel/preset-react", // To support JSX (React)
  ],
  plugins: [
    "@babel/plugin-transform-runtime", // To optimize Babel helpers and reduce bundle size
  ],
};
