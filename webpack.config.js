/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { readFileSync } = require('fs');
const { yamlParse } = require('yaml-cfn');
const ESLintPlugin = require('eslint-webpack-plugin');

const conf = {
	prodMode: process.env.buildEnv === 'prod',
	templatePath: './template.yaml',
};
const cfn = yamlParse(readFileSync(conf.templatePath));
const entries = Object.values(cfn.Resources)
	// Find nodejs functions
	.filter((v) => v.Type === 'AWS::Serverless::Function')
	.filter(
		(v) =>
			(v.Properties.Runtime && v.Properties.Runtime.startsWith('nodejs')) || (!v.Properties.Runtime && cfn.Globals.Function.Runtime),
	)
	.map((v) => ({
		// Isolate handler src filename
		handlerFile: v.Properties.Handler.split('.')[0],
		// Build handler dst path
		CodeUriDir: v.Properties.CodeUri.split('/').splice(2).join('/'),
	}))
	.reduce(
		(entries, v) =>
			Object.assign(
				entries,
				// Generate {outputPath: inputPath} object
				{ [`${v.CodeUriDir}/${v.handlerFile}`]: `./src/${v.handlerFile}.ts` },
			),
		{},
	);

const basePlugins = [
	new ESLintPlugin({
		extensions: [`ts`, `tsx`],
		exclude: [`/node_modules/`],
	}),
];

module.exports = {
	// http://codys.club/blog/2015/07/04/webpack-create-multiple-bundles-with-entry-points/#sec-3
	entry: entries,
	target: 'node',
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: ['ts-loader'],
			},
		],
	},
	optimization: {
		// Because mysql will fail otherwise
		// https://stackoverflow.com/questions/55988989/error-received-packet-in-the-wrong-sequence-when-connect-to-serverless-auror
		minimize: false,
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		libraryTarget: 'commonjs2',
	},
	devtool: 'source-map',
	plugins: conf.prodMode ? [...basePlugins] : [...basePlugins],
};
