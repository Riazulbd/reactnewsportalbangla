import Header from "../../../components/Header";
import { notFound } from "next/navigation";

// Mock Data Store (Simulating DB)
const articles: Record<string, { title: string; author: string; date: string; content: string; image?: string }> = {
    "global-markets-rally": {
        title: "Global Markets Rally as Tech Giants Announce Major Breakthroughs",
        author: "Sarah Jenkins",
        date: "Dec 11, 2025",
        content: `
      <p>Investors are celebrating a wave of innovation that promises to reshape industries. Analysts predict a sustained period of growth as new technologies enter the mainstream market.</p>
      <p>The surge was led by major announcements from Silicon Valley's biggest players, who unveiled new artificial intelligence models capable of reasoning at human parity. This development is expected to unlock trillions of dollars in value across healthcare, finance, and logistics sectors.</p>
      <p>"We are witnessing a paradigm shift," said Maria Gonzalez, Chief Economist at Global Trade Fund. "The productivity gains we're modeling are unlike anything we've seen since the industrial revolution."</p>
      <p>However, some experts urge caution. Rapid adoption could lead to temporary labor market disruptions. Policy makers are already convening emergency sessions to discuss safety frameworks and workforce transition programs.</p>
    `
    },
    "senate-passes-climate-bill": {
        title: "Senate Passes New Climate Legislation in Historic Vote",
        author: "James Carter",
        date: "Dec 10, 2025",
        content: `
      <p>The bill aims to reduce carbon emissions by 40% over the next decade, marking a significant shift in energy policy. The legislation includes tax credits for renewable energy adoption and strict penalties for industrial polluters.</p>
      <p>After months of deadlock, a bipartisan coalition finally reached an agreement late Tuesday night. The gallery erupted in applause as the final vote count was read.</p>
    `
    },
    "local-art-festival": {
        title: "Local Art Festival Draws Record Crowds",
        author: "Emily Chen",
        date: "Dec 09, 2025",
        content: `
      <p>Over 50,000 visitors descended on the city center this weekend for the annual Arts & Culture Festival. Local businesses reported their highest revenue days of the year.</p>
      <p>The highlight of the event was a collaborative mural project that involved over 200 community members. "It's beautiful to see everyone come together," said organizer David Smith.</p>
    `
    }
};

export default function ArticlePage({ params }: { params: { slug: string } }) {
    const slug = params.slug;
    const article = articles[slug];

    if (!article) {
        // In a real app, you might fetch from API here.
        // usage: return notFound();
        // For demo, we'll just show a generic template if slug not found
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col">
                <Header />
                <main className="container mx-auto px-4 max-w-3xl py-12">
                    <h1 className="text-4xl font-serif font-bold mb-4">Article Not Found</h1>
                    <p>The article you are looking for does not exist or has been moved.</p>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col">
            <Header />

            <main className="container mx-auto px-4 max-w-3xl py-12">
                {/* Article Header */}
                <header className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-black leading-tight mb-6">
                        {article.title}
                    </h1>

                    <div className="flex justify-center items-center text-xs md:text-sm font-sans text-gray-500 uppercase tracking-widest border-y border-gray-200 py-3">
                        <span className="font-bold text-gray-900 mr-2">By {article.author}</span>
                        <span className="mx-2">•</span>
                        <span>{article.date}</span>
                        <span className="mx-2">•</span>
                        <span>5 Min Read</span>
                    </div>
                </header>

                {/* Featured Image (Placeholder) */}
                <div className="mb-10">
                    <div className="w-full aspect-video bg-gray-200 flex items-center justify-center text-gray-400">
                        [Featured Image]
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-sans text-right">Photo by Staff Photographer</p>
                </div>

                {/* Content */}
                <article
                    className="prose prose-lg max-w-none font-serif text-gray-800 leading-relaxed
            prose-headings:font-serif prose-headings:font-bold prose-headings:text-black
            prose-p:mb-6 first-letter:float-left first-letter:text-7xl first-letter:pr-4 first-letter:font-black first-letter:leading-[0.8]"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Footer / Share */}
                <div className="border-t border-black mt-12 pt-6 flex justify-between items-center">
                    <div className="text-xs font-bold uppercase tracking-wider">Share this article</div>
                    <div className="flex gap-2">
                        {/* Social Placeholders */}
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    </div>
                </div>

            </main>

            <footer className="bg-gray-100 border-t border-gray-300 py-8 mt-auto">
                <div className="container mx-auto px-4 text-center">
                    <div className="text-xs text-gray-500 font-sans">
                        &copy; {new Date().getFullYear()} The News Portal.
                    </div>
                </div>
            </footer>
        </div>
    );
}
