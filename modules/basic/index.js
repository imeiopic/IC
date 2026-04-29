// modules/basic/index.js
// Minimal Fireback module example

export default {
  name: 'basic',
  schemas: [
    {
      name: 'Hello',
      fields: {
        message: { type: 'string', required: true }
      }
    }
  ],
  routes: [
    {
      method: 'get',
      path: '/hello',
      handler: async (req, res) => {
        res.json({ message: 'Hello from Fireback basic module!' });
      }
    }
  ]
};
