'use strict';

module.exports = ({ strapi }) => ({
  async find(params) {
    const { filters, pagination, sort } = params;

    const query = {
      filters: {},
      ...pagination,
      sort: sort || { timestamp: 'desc' }
    };

    // Apply filters
    if (filters.contentType) {
      query.filters.contentType = { $eq: filters.contentType };
    }
    if (filters.userId) {
      query.filters.userId = { $eq: filters.userId };
    }
    if (filters.action) {
      query.filters.action = { $eq: filters.action };
    }
    if (filters.dateFrom || filters.dateTo) {
      query.filters.timestamp = {};
      if (filters.dateFrom) {
        query.filters.timestamp.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.filters.timestamp.$lte = filters.dateTo;
      }
    }

    return await strapi.documents('plugin::audit-log.audit-log').findMany(query);
  },

  async findOne(documentId) {
    return await strapi.documents('plugin::audit-log.audit-log').findOne({
      documentId
    });
  }
});
