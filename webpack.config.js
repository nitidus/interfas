const Path = require('path'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      TerserJSPlugin = require('terser-webpack-plugin'),
      OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

let autoprefixer = require('autoprefixer');

const _ORIGIN = 'src/dist',
      _TARGET = 'public/assets',
      _DEV_MODE = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: {
    app: Path.resolve(__dirname, `${_ORIGIN}/js`)
  },
  output: {
    path: Path.resolve(__dirname, `${_TARGET}/js`),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              sourceMap: true,
              hmr: _DEV_MODE
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer()]
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              includePaths: ['./node_modules']
            }
          }
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '../fonts/[folder]/[name].[ext]'
          }
        }]
      },
      {
        test: /\.(svg|jpeg|png|jpg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '../img/[folder]/[name].[ext]'
          }
        }]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `../css/[name].css`
    })
  ],
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  }
};
