import Link from 'next/link';
import { format } from 'date-fns';

export default function Header() {
    const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');

    return (
        <header className="border-b border-gray-300 bg-[var(--background)]">
            {/* Top Bar */}
            <div className="container mx-auto px-4 py-1 flex justify-between items-center text-xs text-gray-600 font-sans border-b border-gray-200">
                <div className="flex space-x-4">
                    <span className="font-bold">{currentDate}</span>
                    <span>Today&apos;s Paper</span>
                </div>
                <div className="flex space-x-4">
                    <Link href="/login" className="hover:text-black">Log In</Link>
                    <button className="bg-black text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                        Subscribe
                    </button>
                </div>
            </div>

            {/* Main Logo */}
            <div className="py-6 text-center">
                <Link href="/" className="inline-block">
                    <h1 className="font-blackletter text-5xl md:text-7xl tracking-tight leading-none">
                        The News Portal
                    </h1>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="container mx-auto px-4 border-t border-gray-800 border-b border-gray-200 py-2.5">
                <ul className="flex flex-wrap justify-center md:justify-between gap-4 text-xs md:text-sm font-bold font-sans uppercase tracking-wider">
                    {['World', 'U.S.', 'Politics', 'N.Y.', 'Business', 'Opinion', 'Tech', 'Science', 'Health', 'Sports', 'Arts', 'Travel'].map((item) => (
                        <li key={item}>
                            <Link href={`/section/${item.toLowerCase()}`} className="hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                                {item}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Double Border Effect */}
            <div className="border-b border-gray-800 mx-auto container"></div>
        </header>
    );
}
