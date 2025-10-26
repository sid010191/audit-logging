'use strict';

module.exports = async ({ strapi }) => {
  // Register document service middleware globally
  strapi.db.middlewares.subscribe({
    beforeCreate: async (event) => {
      await logAudit(event, 'create', strapi);
    },
    beforeUpdate: async (event) => {
      await logAudit(event, 'update', strapi);
    },
    beforeDelete: async (event) => {
      await logAudit(event, 'delete', strapi);
    }
  });

  // Register permissions
  const actions = [
    {
      section: 'plugins',
      displayName: 'Read Audit Logs',
      uid: 'read',
      pluginName: 'audit-log'
    }
  ];

  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};

async function logAudit(event, action, strapi) {
  // Implementation logic similar to middleware
}
