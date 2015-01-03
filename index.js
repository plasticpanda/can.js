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

Can.prototype.check = function() {
  return this._exec.apply(this, arguments);
};

Can.prototype.assert = function(__, actionName, targetName) {
  assert(this._exec.apply(this, arguments) === true, 'User is not authorized to perform action ' + actionName + ' on object ' + targetName);
};
