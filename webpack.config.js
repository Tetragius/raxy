const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack');

module.exports = () => ({
    mode: "production",
    entry: ["./src/index.ts"],
    resolve: {
        extensions: [".ts"]
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
                            "@babel/preset-env",
                            "@babel/preset-typescript",
                        ],
                        plugins: [
                            ["@babel/plugin-proposal-decorators", { legacy: true }],
                            ["@babel/plugin-proposal-class-properties", { loose: true }],
                            ["@babel/plugin-proposal-optional-chaining"],
                            ["@babel/plugin-proposal-nullish-coalescing-operator"]
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
            baseDir: 'dist',
            out: 'index.d.ts',
        })
    ]
})