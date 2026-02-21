'use strict';

const imgAlt = require('./img-alt');
const buttonType = require('./button-type');
const inputLabel = require('./input-label');
const emptyLinks = require('./empty-links');

/** @type {Rule[]} */
const rules = [imgAlt, buttonType, inputLabel, emptyLinks];

module.exports = rules;
