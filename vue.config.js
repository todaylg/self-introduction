const path = require('path');

module.exports = {
	chainWebpack: config => {
		config.module
			.rule('raw')
			.test(/\.(glsl|fs|vs)$/)
			.use('raw-loader')
			.loader('raw-loader')
			.end();
		config.module
			.rule('glslify')
			.test(/\.(glsl|fs|vs)$/)
			.use('glslify-loader')
			.loader('glslify-loader')
		config.module
			.rule('hdr')
			.test(/\.hdr$/)
			.use('url-loader')
			.loader('url-loader')
			.end();
	},
	configureWebpack: {
		resolve: {
			extensions: ['.glsl', '.fs', '.vs', '.js', '.vue', '.css', '.png', '.jpg', '.jpeg', '.hdr'],
			alias: {
				'@': path.resolve(__dirname, './src'),
				CONST: path.resolve(__dirname, './src/const'),
				JS: path.resolve(__dirname, './src/js'),
				LIB: path.resolve(__dirname, './src/libs'),
				WEBGL: path.resolve(__dirname, './src/webgl'),
				ASSETS: path.resolve(__dirname, './src/assets'),
				CONST: path.resolve(__dirname, './src/const'),
				COMPONENT: path.resolve(__dirname, './src/components'),
				MODULES: path.resolve(__dirname, './src/webgl/modules'),
				SECTIONS: path.resolve(__dirname, './src/webgl/sections'),
			}
		}
	}
};
