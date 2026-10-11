// Vercel function entry. `npm run build` (tsup) runs first on Vercel and
// produces dist/server.js, which exports the Express app.
module.exports = require('../dist/server.js').default;
