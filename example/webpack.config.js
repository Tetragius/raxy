const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = () => ({
    mode: "development",
    devtool: "source-map",
    entry: ["babel-polyfill", './src/app.tsx'],
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'main.js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        babelrc: false,
                        presets: [
                            [
                                "@babel/preset-env",
                                { targets: { browsers: "last 2 versions" } }
                            ],
                            "@babel/preset-typescript",
                            "@babel/preset-react"
                        ],
                        plugins: [
                            ["@babel/plugin-proposal-decorators", { legacy: true }],
                            ["@babel/plugin-proposal-class-properties", { loose: true }],
                            "react-hot-loader/babel"
                        ]
                    }
                },
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.ejs'
        }),
        new ForkTsCheckerWebpackPlugin(),
    ]
})