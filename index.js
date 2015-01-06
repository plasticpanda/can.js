'use strict';

/**
 * Can.js
 * ======
 * micro authorization library
 * 
 * Usage:
 * var authorizations = require('./config/authorizations.js')
 * var can = new Can();
 * 
 * 
 * Configuration file is like (see also example/config.js):
 *   
 *  '*': {
 *    '*': hasRole('admin')
 *  },
 *  
 *  'user': {
 *    
 *    'create': [isAuthenticated, function (user, object) {
 *      return object.owner === user;
 *    }],
 *    
 *    'delete': [hasRole('admin'), function () {
 *      return true;
 *    }]
 * 
 * 
 */

var assert = require('assert');
var debug = require('debug')('can.js');
var _ = require('lodash');

module.exports = Can;

/**
 * Constructor
 * @param Object config_ Configuration object (see test/config.js for an axample)
 */
function Can(config_) {
  
  debug('Loaded config file');
  
  this._exec = function (user, actionName, targetName, targetObject) {
    var authorized = false;
    
    authorized = _.any(Object.keys(config_), function (configTarget) {
      
      if (configTarget !== '*' && configTarget !== targetName) {
        // skip non-matching target name
        return false;
      }
      
      debug('Matching target "%s"', configTarget);
      
      return _.any(Object.keys(config_[configTarget]), function (configAction) {
        
        if (configAction !== '*' && configAction !== actionName) {
          // skip non-matching actions name
          return false;
        }
        
        debug('Matching action "%s"', configAction);
        
        var fns = config_[configTarget][configAction];
        
        if (!Array.isArray(fns)) {
          throw new Error('ConfigurationError: Value should be an array (of functions), not ' + typeof fns);
        }
        
        debug('Running %d checks', fns.length);
        
        if (fns.length === 0) {
          debug('Not authorized because there are no checks for this rule.');
          return false;
        }
        
        var result = _.every(fns, function runner(fn) {
          debug('targetObject is %s', targetObject);
          return fn(user, targetObject);
        });
        
        if (result) {
          debug('All passed, user is authorized');
        } else {
          debug('Rule does not authorize user, falling back to default deny');
        }
        
        return result;
        
      });
      
    });
    
    return authorized;
  };
  
}

/**
 * Check if user is authorized to perform an action
 * @param  {object} user         an user instance (any value, type, schema,...)
 * @param  {string} actionName   action the user is trying to perform
 * @param  {string} targetName   object type on which the action is being performed (e.g.: user, blog, photo)
 * @param  {object|undefined} targetObject the actual object the action is being performed on (e.g.: object from db)
 * @return {boolean}              true or false
 */
Can.prototype.check = function(user, actionName, targetName, targetObject) {
  return this._exec.call(this, user, actionName, targetName, targetObject);
};


/**
 * Check if user is authorized to perform an action; throws if not
 * @throws {AssertionError} If user is not authorized to perform this action
 */
Can.prototype.assert = function(user, actionName, targetName, targetObject) {
  assert(this._exec.call(this, user, actionName, targetName, targetObject) === true, 'User is not authorized to perform action ' + actionName + ' on object ' + targetName);
};
