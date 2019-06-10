const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './client_build/SimpleGame.ts',
    mode : "development",

    devtool: 'source-map',
    watch: true,


    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'client_dist')
    },

    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },

    plugins: [
        new CopyPlugin([
            { from: path.resolve(__dirname, 'client_build', 'image'), to: path.resolve(__dirname, 'client_dist', 'image') },
            { from: path.resolve(__dirname, 'client_build', 'index.html'), to: path.resolve(__dirname, 'client_dist', 'index.html') },
        ]),
    ],


};