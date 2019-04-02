const path = require('path');

module.exports = {
    entry: './client_build/app.js',
    mode : "production",

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'client_dist')
    },
    resolve: {
        alias: {
            pixi: path.join(__dirname, 'node_modules/phaser-ce/build/custom/pixi.js'),
            phaser: path.join(__dirname, 'node_modules/phaser-ce/build/custom/phaser-minimum.js'),
            p2: path.join(__dirname, 'node_modules/phaser-ce/build/custom/p2.js'),
        }
    },
    module: {
        rules: [
            { test: /pixi\.js$/, loader: 'expose-loader?PIXI' },
            { test: /phaser-minimum\.js$/, loader: 'expose-loader?Phaser' },
            { test: /p2\.js$/, loader: 'expose-loader?p2' },
        ]
    }
};