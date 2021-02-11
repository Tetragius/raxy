const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = () => ({
    mode: "production",
    entry: {
        "raxy/dist/index": ["./packages/raxy"],
        "raxy-react/dist/index": ["./packages/raxy-react"],
        "raxy-vue/dist/index": ["./packages/raxy-vue"],
        "raxy-polyfill/dist/index": ["./packages/raxy-polyfill/index.ts"],
    },
    resolve: {
        extensions: [".ts"],
        plugins: [
            new TsconfigPathsPlugin({}),
        ]
    },
    output: {
        library: 'raxy',
        libraryTarget: 'umd',
        path: path.join(__dirname, '/packages'),
        filename: '[name].js'
    },
    externals: [
        {
            react: 'react',
            "@tetragius/raxy": '@tetragius/raxy'
        }
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
    }
})