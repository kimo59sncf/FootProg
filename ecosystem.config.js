module.exports = {
  apps: [
    {
      name: 'footprog',
      script: 'server/index.js',
      instances: 'max', // Utilise tous les CPU disponibles
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        USE_SQLITE: true
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        USE_SQLITE: true
      },
      // Gestion des logs
      log_file: '/var/log/footprog/combined.log',
      out_file: '/var/log/footprog/out.log',
      error_file: '/var/log/footprog/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Redémarrage automatique
      watch: false,
      ignore_watch: ['logs', 'node_modules', '.git'],
      max_restarts: 10,
      min_uptime: '10s',
      
      // Gestion mémoire
      max_memory_restart: '1G',
      
      // Variables d'environnement
      env_file: '.env.production',
      
      // Monitoring
      monitoring: false,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000,
      
      // Health check
      health_check_url: 'http://localhost:3000/health',
      health_check_grace_period: 3000
    }
  ],

  deploy: {
    production: {
      user: 'footprog',
      host: 'your_server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/footprog.git',
      path: '/var/www/footprog',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci --production && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    },
    staging: {
      user: 'footprog',
      host: 'staging.your_server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/footprog.git',
      path: '/var/www/footprog-staging',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
};
