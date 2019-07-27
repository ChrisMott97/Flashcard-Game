const path = require('path');

module.exports = {
    entry: {
        app: './app/static/src/index.js',
        admin: './app/static/src/admin.js',
        create: './app/static/src/create.js'
    },
    output: {
        filename: '[name].js',
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