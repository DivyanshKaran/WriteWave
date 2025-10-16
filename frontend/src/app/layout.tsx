import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "../styles/globals.css";
import { StoreInitializer } from "@/components/StoreInitializer";
import MonochromeAppShell from "@/components/layout/MonochromeAppShell";

// Font configuration
const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "500", "600"],
});

const spaceGrotesk = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
	display: "swap",
	weight: ["500", "700"],
});

// Enhanced metadata for Japanese learning platform
export const metadata: Metadata = {
	title: {
		default: "WriteWave - Master Japanese Writing",
		template: "%s | WriteWave"
	},
	description: "Learn Japanese characters (Hiragana, Katakana, Kanji) with interactive writing practice, OCR feedback, and gamified learning. Track your progress, build streaks, and achieve mastery.",
	keywords: [
		"Japanese learning",
		"Hiragana",
		"Katakana", 
		"Kanji",
		"Japanese writing",
		"OCR",
		"language learning",
		"character recognition",
		"stroke order",
		"Japanese practice"
	],
	authors: [{ name: "WriteWave Team" }],
	creator: "WriteWave",
	publisher: "WriteWave",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL('https://writewave.app'),
	alternates: {
		canonical: '/',
		languages: {
			'en-US': '/en',
			'ja-JP': '/ja',
		},
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		alternateLocale: 'ja_JP',
		url: 'https://writewave.app',
		title: 'WriteWave - Master Japanese Writing',
		description: 'Learn Japanese characters with interactive writing practice and OCR feedback.',
		siteName: 'WriteWave',
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: 'WriteWave - Japanese Learning Platform',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'WriteWave - Master Japanese Writing',
		description: 'Learn Japanese characters with interactive writing practice and OCR feedback.',
		images: ['/twitter-image.png'],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	verification: {
		google: 'your-google-verification-code',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja" dir="ltr">
			<head>
				{/* Preconnect to external domains for performance */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				
				{/* Favicon and app icons */}
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" href="/icon.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				
				{/* Theme color for mobile browsers */}
				<meta name="theme-color" content="#0066ff" />
				<meta name="color-scheme" content="light dark" />
				
				{/* Viewport configuration */}
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
				
				{/* Japanese language support */}
				<meta httpEquiv="Content-Language" content="ja" />
				<meta name="language" content="Japanese" />
				
				{/* Performance hints */}
				<link rel="dns-prefetch" href="//api.writewave.app" />
				
				{/* Analytics scripts (placeholder) */}
				{process.env.NODE_ENV === 'production' && (
					<>
						{/* Google Analytics */}
						<script
							dangerouslySetInnerHTML={{
								__html: `
									window.dataLayer = window.dataLayer || [];
									function gtag(){dataLayer.push(arguments);}
									gtag('js', new Date());
									gtag('config', 'GA_MEASUREMENT_ID');
								`,
							}}
						/>
						<script
							async
							src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
						/>
					</>
				)}
			</head>
			<body
				className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
				suppressHydrationWarning={true}
			>
				{/* Store initialization for global state */}
				<StoreInitializer />
				
				{/* Main application content wrapped in monochrome shell */}
				<div id="root" className="min-h-screen">
					<MonochromeAppShell>
						{children}
					</MonochromeAppShell>
				</div>
				
				{/* Skip to main content for accessibility */}
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-sm z-50"
				>
					Skip to main content
				</a>
			</body>
		</html>
	);
}
