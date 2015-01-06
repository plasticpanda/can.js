'use strict';

var tape = require('tape');

var Can = require('../');
var permissions = require('./config');
var can = new Can(permissions);

var fixitures = {
  user_anonymous: null,
  user_john: { id: 123, role: 'user' },
  user_admin: { id: 456, role: 'admin' },
  post_byjohn: { owner: 123 },
  post_byjane: { owner: 666 }
};


tape('anonymous user', function (t) {
  t.ok(can.check(fixitures.user_anonymous, 'visit', 'site'), 'can visit website');
  t.notOk(can.check(fixitures.user_anonymous, 'comment', 'site'), 'cannot comment');
  t.notOk(can.check(fixitures.user_anonymous, 'create', 'post'), 'cannot create a new post');
  t.notOk(can.check(fixitures.user_anonymous, 'edit', 'post'), 'cannot edit any post');
  t.notOk(can.check(fixitures.user_anonymous, 'delete', 'post'), 'cannot delete any post');
  t.end();
});


tape('logged in user', function (t) {
  t.ok(can.check(fixitures.user_john, 'visit', 'site'), 'can visit website');
  t.ok(can.check(fixitures.user_john, 'comment', 'site'), 'can comment');
  t.ok(can.check(fixitures.user_john, 'create', 'post'), 'can create a new post');
  t.notOk(can.check(fixitures.user_john, 'delete', 'post'), 'cannot delete any post');
  t.ok(can.check(fixitures.user_john, 'edit', 'post', fixitures.post_byjohn), 'can edit his own post');
  t.notOk(can.check(fixitures.user_john, 'edit', 'post', fixitures.post_byjane), 'cannot edit others\' posts');
  t.end();
});


tape('admin user', function (t) {
  t.ok(can.check(fixitures.user_admin, 'visit', 'site'), 'can visit website');
  t.ok(can.check(fixitures.user_admin, 'comment', 'site'), 'can comment');
  t.ok(can.check(fixitures.user_admin, 'create', 'post'), 'can create a new post');
  t.ok(can.check(fixitures.user_admin, 'delete', 'post'), 'can delete any post');
  t.ok(can.check(fixitures.user_admin, 'edit', 'post', fixitures.post_byjohn), 'can edit every post');
  t.ok(can.check(fixitures.user_admin, 'edit', 'post', fixitures.post_byjane), 'can edit every post');
  t.end();
});


tape('rule with no checks', function (t) {
  t.notOk(can.check(fixitures.user_john, 'destroy', 'humanity'), 'evaluates to false');
  t.throws(function () { can.assert(fixitures.user_john, 'destroy', 'humanity'); }, '...or throws');
  t.end();
});


tape('nonexistent rules', function (t) {
  t.notOk(can.check(fixitures.user_john, 'foo', 'baz'), 'evaluates to false');
  t.ok(can.check(fixitures.user_admin, 'foo', 'bar'), '...unless they match a wildcard');
  t.end();
});


tape('throw on forbidden', function (t) {
  t.doesNotThrow(function () { can.assert(fixitures.user_anonymous, 'visit', 'site'); }, 'can visit website');
  t.throws(function () { can.assert(fixitures.user_anonymous, 'comment', 'site'); }, 'cannot comment');
  t.throws(function () { can.assert(fixitures.user_anonymous, 'foo', 'bar'); }, 'on nonexistent rule');
  t.end();
});
