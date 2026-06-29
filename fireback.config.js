module.exports = {
  database:
    process.env.NODE_ENV === 'production'
      ? {
          dialect: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME || 'fireback_prod'
        }
      : {
          dialect: 'sqlite',
          storage: './fireback.sqlite'
        },
  modules: ['./modules/basic'],
  cors: {
    origin: ['https://localhost:5173', 'http://localhost:5173', 'https://127.0.0.1:5173']
  }
  // publicDir: "./public"
};
