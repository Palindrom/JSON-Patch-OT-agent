var webpack = require("webpack");

module.exports = [
  {
    entry: "./newsrc/json-patch-ot-agent.js",
    output: {
      filename: "dist/json-patch-ot-agent.min.js",
      library: "JSONPatchOTAgent",
      libraryTarget: "var"
    },
    resolve: {
      extensions: [".js"]
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  },
  {
    entry: "./newsrc/json-patch-ot-agent.js",
    output: {
      filename: "dist/json-patch-ot-agent.js",
      library: "JSONPatchOTAgent",
      libraryTarget: "commonjs2"
    },
    resolve: {
      extensions: [".js"]
    }
  }
];
