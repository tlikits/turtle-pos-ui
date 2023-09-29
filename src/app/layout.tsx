import MainFrame from '@/components/main-frame/main-frame';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './globals2.css';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Barista Station',
	description: 'Barista station application for running in BMA',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<link rel="icon" href="/squirtle-favicon.png" sizes="any" />
			<body className={inter.className}>
				<MainFrame>
					{children}
				</MainFrame>
			</body>
		</html>
	)
}
