// CRACO config: strip all console.* calls from PRODUCTION builds only (security/cleanliness).
// Dev builds keep console for debugging.
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  babel: {
    plugins: isProd
      ? [['transform-remove-console', { exclude: [] }]] // exclude: [] -> remove EVERYTHING (log/error/warn/info/debug)
      : [],
  },
};
