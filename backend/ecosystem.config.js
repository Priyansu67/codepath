module.exports = {
  apps: [{
    name: 'codepath-api',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000,
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    restart_delay: 4000,
    max_memory_restart: '500M',
  }],
};
