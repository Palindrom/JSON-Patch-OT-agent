var webpack = require("webpack");

module.exports = [
  {
    entry: "./src/json-patch-ot-agent.js",
    output: {
      filename: "dist/json-patch-ot-agent.bundle.js",
      library: "JSONPatchOTAgent",
      libraryTarget: "var"
    },
    resolve: {
      extensions: [".js"]
    }
  },
  {
    entry: "./src/json-patch-ot-agent.js",
    output: {
      filename: "dist/json-patch-ot-agent.bundle.min.js",
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
  }
];
