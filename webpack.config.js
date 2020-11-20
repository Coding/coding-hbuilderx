const path = require('path');

module.exports = {
  entry: {
    main: './webviews/index.tsx'
  },
  output: {
    path: path.resolve(__dirname, 'out/webviews'),
    filename: '[name].js',
  },
  // devtool: 'cheap-module-source-map',
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader',
        options: {},
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
              },
            },
          },
        ],
      },
    ],
  },
  performance: {
    hints: false,
  },
};
