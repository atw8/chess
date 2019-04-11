const path = require('path');

module.exports = {
    entry: './client_build/app.ts',
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
    }



};