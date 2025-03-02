'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDomServer = require('react-dom/server');

var _tempJsx = require('./temp.jsx');

var _tempJsx2 = _interopRequireDefault(_tempJsx);

console.log((0, _reactDomServer.renderToString)(_react2['default'].createElement(_tempJsx2['default'], null)));
