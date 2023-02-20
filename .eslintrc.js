module.exports = {
  'root': true,
  'env': {
    "browser": true,
    "jquery": true,
    "es2020": true
  },
  'extends': [
    'plugin:vue/essential'
  ],
  'rules': {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}

