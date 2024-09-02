const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    target: 'node',
    mode: 'production',
    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /^express\/lib\/view$/,
        }),
    ],
};
