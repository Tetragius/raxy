const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack');

module.exports = () => ({
    mode: "production",
    entry: ["./src/core.ts"],
    resolve: {
        extensions: [".ts", ".tsx"]
    },
    output: {
        library: 'raxy',
        libraryTarget: 'umd',
        path: path.join(__dirname, '/dist'),
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
                        ]
                    }
                }
            },
        ]
    },
    plugins: [
        new DtsBundleWebpack({
            name: "raxy",
            main: 'build/core.d.ts',
            baseDir: 'dist',
            out: 'index.d.ts',
        })
    ]
})