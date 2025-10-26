'use strict';

module.exports = {
  async find(ctx) {
    // Check permission
    await strapi.admin.services.permission.check(ctx, {
      name: 'plugin::audit-log.read'
    });

    const { query } = ctx.request;

    const params = {
      filters: {
        contentType: query.contentType,
        userId: query.userId ? parseInt(query.userId) : undefined,
        action: query.action,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo
      },
      pagination: {
        page: query.page ? parseInt(query.page) : 1,
        pageSize: query.pageSize ? parseInt(query.pageSize) : 25
      },
      sort: query.sort ? JSON.parse(query.sort) : { timestamp: 'desc' }
    };

    try {
      const data = await strapi
        .plugin('audit-log')
        .service('audit-log')
        .find(params);

      ctx.body = { data };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async findOne(ctx) {
    await strapi.admin.services.permission.check(ctx, {
      name: 'plugin::audit-log.read'
    });

    const { id } = ctx.params;

    try {
      const data = await strapi
        .plugin('audit-log')
        .service('audit-log')
        .findOne(id);

      ctx.body = { data };
    } catch (err) {
      ctx.throw(404, err);
    }
  }
};
