import Image from 'next/image';

export default function LeadStory() {
    return (
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 py-6 border-b border-gray-300">

            {/* Main Story (Left - 8 Columns) */}
            <div className="md:col-span-8 flex flex-col gap-4">
                <div className="flex flex-col-reverse md:flex-row gap-6">
                    {/* Headline & Text */}
                    <div className="flex-1">
                        <h2 className="text-4xl md:text-5xl font-serif font-black leading-tight mb-4 hover:text-gray-700 cursor-pointer">
                            Global Markets Rally as Tech Giants Announce Major Breakthroughs
                        </h2>
                        <p className="text-lg text-gray-700 font-serif leading-relaxed mb-4">
                            Investors are celebrating a wave of innovation that promises to reshape industries. Analysts predict a sustained period of growth as new technologies enter the mainstream market.
                        </p>
                        <div className="text-xs text-gray-500 font-sans uppercase font-bold mb-2">
                            By <span className="text-black">Sarah Jenkins</span> | 5 Min Read
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="md:w-2/3 relative aspect-video md:aspect-[4/3]">
                        {/* Placeholder for now */}
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400 font-sans text-sm">
                            [Featured Image Placeholder]
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Stories (Right - 4 Columns) */}
            <div className="md:col-span-4 border-l border-gray-200 pl-0 md:pl-6 flex flex-col gap-6">

                {/* Story 2 */}
                <article className="group cursor-pointer">
                    <h3 className="text-xl font-serif font-bold mb-2 group-hover:underline">
                        Senate passes new climate legislation in historic vote
                    </h3>
                    <p className="text-sm text-gray-600 font-serif leading-snug">
                        The bill aims to reduce carbon emissions by 40% over the next decade, marking a significant shift in energy policy.
                    </p>
                </article>

                <hr className="border-gray-200" />

                {/* Story 3 */}
                <article className="group cursor-pointer">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-serif font-bold mb-2 group-hover:underline">
                                Local Art Festival Draws Record Crowds
                            </h3>
                        </div>
                        <div className="w-16 h-16 bg-gray-200 shrink-0"></div>
                    </div>
                </article>

                <hr className="border-gray-200" />

                {/* Opinion Teaser */}
                <div className="bg-[var(--background)]">
                    <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-[#8b0000] mb-2">Opinion</h4>
                    <article>
                        <h3 className="text-xl font-serif italic mb-1 hover:text-[#8b0000] cursor-pointer">Why we need to rethink urban planning</h3>
                        <span className="text-xs text-gray-500 font-sans">James Carter</span>
                    </article>
                </div>

            </div>
        </section>
    );
}
