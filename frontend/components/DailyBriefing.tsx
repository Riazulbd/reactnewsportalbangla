export default function DailyBriefing() {
    const briefings = [
        "Tech: New AI models outperform humans in reasoning benchmarks.",
        "Politics: Summit talks conclude with tentative agreement on trade.",
        "Health: Study links Mediterranean diet to improved longevity.",
    ];

    return (
        <div className="bg-gray-100 p-4 border-t-4 border-black my-6">
            <h3 className="font-sans font-bold text-lg mb-3 uppercase tracking-wide">Daily Briefing</h3>
            <ul className="space-y-2">
                {briefings.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm font-serif leading-relaxed">
                        <span className="font-bold text-gray-400">•</span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
