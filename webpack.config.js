const path = require('path');

module.exports = {
    entry: './app/static/src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'app/static/dist')
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    }

};