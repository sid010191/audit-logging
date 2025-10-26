'use strict';

const _ = require('lodash');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const { action, params } = ctx;

    // Get plugin config
    const pluginConfig = strapi.config.get('plugin.audit-log', {
      enabled: true,
      excludeContentTypes: []
    });

    if (!pluginConfig.enabled) {
      return next();
    }

    // Extract content type from context
    const contentType = ctx.uid;

    // Skip if content type is excluded
    if (pluginConfig.excludeContentTypes.includes(contentType)) {
      return next();
    }

    // Skip audit-log itself to prevent infinite loop
    if (contentType === 'plugin::audit-log.audit-log') {
      return next();
    }

    let beforeData = null;

    // Capture before state for updates
    if (action === 'update' && params.documentId) {
      try {
        beforeData = await strapi.documents(contentType).findOne({
          documentId: params.documentId
        });
      } catch (err) {
        strapi.log.warn('Failed to fetch before state for audit log:', err);
      }
    }

    // Execute the actual operation
    await next();

    // Log after operation completes
    try {
      const user = ctx.state.user;
      const auditData = {
        contentType,
        recordId: params.documentId || ctx.body?.documentId || 'unknown',
        action: mapAction(action),
        userId: user?.id,
        userName: user?.username || user?.email,
        timestamp: new Date(),
        ipAddress: ctx.request.ip,
        userAgent: ctx.request.get('user-agent')
      };

      // Add payload and changes based on action
      if (action === 'create') {
        auditData.payload = sanitizePayload(params.data);
      } else if (action === 'update') {
        auditData.payload = sanitizePayload(params.data);
        if (beforeData) {
          auditData.changes = calculateDiff(beforeData, ctx.body);
        }
      } else if (action === 'delete') {
        auditData.payload = beforeData ? sanitizePayload(beforeData) : null;
      }

      // Create audit log entry
      await strapi.documents('plugin::audit-log.audit-log').create({
        data: auditData
      });
    } catch (err) {
      strapi.log.error('Failed to create audit log entry:', err);
      // Don't throw - audit logging should not break main operation
    }
  };
};

function mapAction(action) {
  const actionMap = {
    'create': 'create',
    'update': 'update',
    'delete': 'delete',
    'publish': 'publish',
    'unpublish': 'unpublish'
  };
  return actionMap[action] || action;
}

function sanitizePayload(data) {
  // Remove sensitive fields
  const sanitized = _.cloneDeep(data);
  delete sanitized.password;
  delete sanitized.resetPasswordToken;
  return sanitized;
}

function calculateDiff(before, after) {
  const changes = {};
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {})
  ]);

  for (const key of allKeys) {
    if (key === 'updatedAt' || key === 'createdAt') continue;

    if (!_.isEqual(before?.[key], after?.[key])) {
      changes[key] = {
        from: before?.[key],
        to: after?.[key]
      };
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}
