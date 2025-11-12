import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata = {
title: 'Lotwise Portfolio Tracker',
description: 'Track your portfolio with lot-based accounting',
};

export default function RootLayout({ children }) {
return (
<html lang="en">
<body>
<Navigation />
<main className="container mx-auto px-4 py-8">{children}</main>
</body>
</html>
);
}

