const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// for css
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// for html
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs')

function generateHtmlPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map(item => {
    const parts = item.split('.');
    const name = parts[0];
    const extension = parts[1];
    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),

      // добавление ссылок на css && js файлы в html
      // inject: false,
    })
  })
}
// Перебирает все html файлы из папки pages
const htmlPlugins = generateHtmlPlugins('./src/html/pages')

module.exports = {
  entry: [
    './src/js/index.js',
  ],
  output: {
    filename: './js/bundle.js'
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src/js'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(sass|scss)$/,
        include: path.resolve(__dirname, 'src/scss'),
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              url: false,
              sourceMap: true
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: [
                require('autoprefixer'),
                require('css-mqpacker'),
                require('cssnano')({
                  preset: [
                    'default', {
                      discardComments: {
                        removeAll: true,
                      }
                    }
                  ]
                })
              ]
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            }
          }
          
        ],
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: './css/style.css'
    }),
    new CopyPlugin([
      {
        from: './src/assets',
        to: './assets'
      }
    ]),
  ].concat(htmlPlugins),

  // Необходим для доступа из локальной сети
  // devServer: {
  //   port: 8000,
  //   // TODO указать свой IP
  //   // Узнать IP можно следующими командами: ipconfig (Windows), ifconfig (Linux), netstat (macOS).
  //   host: '192.168.0.103',
  // }
};