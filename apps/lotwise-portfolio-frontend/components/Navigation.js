import Link from 'next/link';

export default function Navigation() {
return (
<nav className="bg-blue-600 text-white shadow-lg">
<div className="container mx-auto px-4">
<div className="flex items-center justify-between h-16">
<div className="flex items-center space-x-8">
<h1 className="text-xl font-bold">📊 Portfolio Tracker</h1>
<div className="flex space-x-4">
<Link href="/" className="px-3 py-2 rounded-md hover:bg-blue-700 transition">Add Trade</Link>
<Link href="/positions" className="px-3 py-2 rounded-md hover:bg-blue-700 transition">Positions</Link>
<Link href="/pnl" className="px-3 py-2 rounded-md hover:bg-blue-700 transition">P&L</Link>
</div>
</div>
</div>
</div>
</nav>
);
}

