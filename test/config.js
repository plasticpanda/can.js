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
    '*': [hasRole('admin')]
  },
  
  'post': {
    
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
    
  }
  
};
