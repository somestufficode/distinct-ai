const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    },
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  webpack: (config: any, options: any) => {
    config.externals = [
      ...(config.externals || []),
      {
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      },
    ];
    return config;
  },
};
