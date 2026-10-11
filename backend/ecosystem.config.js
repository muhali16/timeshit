module.exports = {
  apps: [
    {
      name: 'timeshit',
      script: 'src/server.js',
      env: {
        // punycode warning comes from firebase-admin's node-fetch@2 dep
        NODE_OPTIONS: '--disable-warning=DEP0040',
      },
    },
  ],
};
