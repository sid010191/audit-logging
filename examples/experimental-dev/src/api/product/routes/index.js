'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/audit-logs',
    handler: 'audit-log.find',
    config: {
      policies: [],
      auth: {
        scope: ['plugin::audit-log.read']
      }
    }
  },
  {
    method: 'GET',
    path: '/audit-logs/:id',
    handler: 'audit-log.findOne',
    config: {
      policies: [],
      auth: {
        scope: ['plugin::audit-log.read']
      }
    }
  }
];
