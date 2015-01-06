'use strict';


function isAuthenticated(user) {
  return user && user.id;
}

function hasRole(role) {
  return function _hasRoleInner(user) {
    return isAuthenticated(user) && user.role === role;
  };
}


module.exports = {
  
  '*': {
    '*': [hasRole('admin')] // admin users are always allowed to perfor any action,
                            //  if the right-side evaluates to "true" the action is authorized
                            //  else, the next rules are evaluated
                            //  if no rule evaluates to true the default action is to deny the action
  },
  
  'post': {
    
    // every function in the array *must* return true for this action to be authorized
    'create': [isAuthenticated, function () {
      return true;
    }],
    
    'edit': [isAuthenticated, function (user, object) {
      return object.owner === user.id;
    }],
    
    'delete': [hasRole('admin'), function () {
      return true;
    }],
    
  },
  
  'site': {
    
    'comment': [isAuthenticated, function () {
      return true;
    }],
    
    'visit': [function () {
      return true;
    }]
    
  },
  
  'humanity': {
    
    'destroy': []
    
  }
  
};
