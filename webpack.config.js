const path = require('path');

module.exports = {
    entry: {
        app: './app/static/src/index.js',
        admin: './app/static/src/admin.js',
        create: './app/static/src/create.js',
        test: './app/static/src/test.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'app/static/dist')
    },
    mode: 'development',
    resolve: { extensions: ["*", ".js", ".jsx"] },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
                options: { presets: ["@babel/env", "@babel/react"] }
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },{
                test: /\.woff$/,
                use: [
                    'file-loader'
                ]
            },{
            test: /\.svg/,
            use: {
                loader: 'svg-url-loader',
                options: {}
            }
        }
        ]
    }

};