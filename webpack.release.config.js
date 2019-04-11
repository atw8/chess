const path = require('path');

module.exports = {
    entry: './client_build/app.js',
    mode : "production",

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'client_dist')
    }
};