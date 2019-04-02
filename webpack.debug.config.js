const path = require('path');

module.exports = {
    entry: './client_build/app.js',
    mode : "development",

    devtool: 'source-map',

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'client_dist')
    },
    resolve: {
        alias: {
            pixi: path.join(__dirname, 'node_modules/phaser-ce/build/custom/pixi.js'),
            phaser: path.join(__dirname, 'node_modules/phaser-ce/build/custom/phaser-split.js'),
            p2: path.join(__dirname, 'node_modules/phaser-ce/build/custom/p2.js'),
        }
    },

    watch: true,

    module: {
        rules: [
            { test: /pixi\.js$/, loader: 'expose-loader?PIXI' },
            { test: /phaser-split\.js$/, loader: 'expose-loader?Phaser' },
            { test: /p2\.js$/, loader: 'expose-loader?p2' },
        ]
    }
};