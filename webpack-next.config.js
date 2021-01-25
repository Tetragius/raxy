const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack');

module.exports = () => ({
    mode: "production",
    entry: ["./src/index.ts"],
    resolve: {
        extensions: [".ts", ".tsx"]
    },
    output: {
        library: 'raxy',
        libraryTarget: 'umd',
        path: path.join(__dirname, '/next'),
        filename: 'index.js'
    },
    externals: [
        { react: 'react' }
    ],
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
                            "@babel/preset-typescript",
                            "@babel/preset-react"
                        ],
                        plugins: [
                            ["@babel/plugin-proposal-decorators", { legacy: true }],
                            ["@babel/plugin-proposal-class-properties", { loose: true }],
                            ["@babel/plugin-proposal-optional-chaining"]
                        ]
                    }
                }
            },
        ]
    },
    plugins: [
        new DtsBundleWebpack({
            name: "raxy",
            main: 'build/index.d.ts',
            baseDir: 'next',
            out: 'index.d.ts',
        })
    ]
})