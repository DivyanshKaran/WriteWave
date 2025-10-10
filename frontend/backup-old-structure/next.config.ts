import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Enable experimental features for App Router
	experimental: {
		// Enable optimized package imports
		optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
		// Enable webpack build worker
		webpackBuildWorker: true,
	},

	// Server external packages
	serverExternalPackages: ['opencv.js'],

	// Webpack configuration for OpenCV.js and other optimizations
	webpack: (config, { isServer }) => {
		// Handle OpenCV.js
		config.resolve.alias = {
			...config.resolve.alias,
			'opencv.js': 'opencv.js/dist/opencv.js',
		};

		// Configure fallbacks for Node.js modules in browser
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			path: false,
			crypto: false,
		};

		// Optimize for Japanese character processing
		config.optimization = {
			...config.optimization,
			splitChunks: {
				chunks: 'all',
				cacheGroups: {
					opencv: {
						test: /[\\/]node_modules[\\/]opencv\.js[\\/]/,
						name: 'opencv',
						chunks: 'all',
						priority: 10,
					},
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendors',
						chunks: 'all',
						priority: 5,
					},
				},
			},
		};

		// Handle WASM files
		config.module.rules.push({
			test: /\.wasm$/,
			type: 'asset/resource',
		});

		return config;
	},

	// Image configuration
	images: {
		// Allow images from external domains
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'api.writewave.app',
				port: '',
				pathname: '/**',
			},
		],
		// Image optimization settings
		formats: ['image/webp', 'image/avif'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},

	// Environment variables
	env: {
		CUSTOM_KEY: process.env.CUSTOM_KEY,
		API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
		OPENCV_JS_URL: process.env.OPENCV_JS_URL || '/opencv.js',
	},

	// Headers for security and performance
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Referrer-Policy',
						value: 'origin-when-cross-origin',
					},
					{
						key: 'Permissions-Policy',
						value: 'camera=(), microphone=(), geolocation=()',
					},
				],
			},
			{
				source: '/opencv.js',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
		];
	},

	// Redirects for SEO and user experience
	async redirects() {
		return [
			{
				source: '/home',
				destination: '/',
				permanent: true,
			},
			{
				source: '/dashboard',
				destination: '/learn',
				permanent: true,
			},
		];
	},

	// Output configuration
	output: 'standalone',

	// Compression
	compress: true,

	// Power optimization
	poweredByHeader: false,

	// React strict mode
	reactStrictMode: true,

	// SWC minification (default in Next.js 15)

	// TypeScript configuration
	typescript: {
		ignoreBuildErrors: false,
	},

	// ESLint configuration
	eslint: {
		ignoreDuringBuilds: false,
	},
};

export default nextConfig;
