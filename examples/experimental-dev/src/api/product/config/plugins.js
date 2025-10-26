module.exports = ({ env }) => ({
  'audit-log': {
    enabled: true,
    resolve: './src/plugins/audit-log',
    config: {
      enabled: true,
      excludeContentTypes: [
        'admin::user',
        'admin::role',
        'admin::permission'
      ]
    }
  }
});
