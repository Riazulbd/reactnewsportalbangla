import Header from "../components/Header";
import LeadStory from "../components/LeadStory";
import DailyBriefing from "../components/DailyBriefing";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Header />

      <main className="container mx-auto px-4 flex-grow">
        <LeadStory />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
          {/* Main Feed - 8 Cols */}
          <div className="md:col-span-8">
            <h4 className="font-sans font-bold text-xs uppercase border-t border-black pt-1 mt-6 mb-4">Latest News</h4>

            {/* Fake Article List */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <article key={i} className="flex flex-col md:flex-row gap-4 border-b border-gray-200 pb-6">
                  <div className="flex-1">
                    <h3 className="font-serif text-xl font-bold mb-2 hover:underline cursor-pointer">
                      Technology sector sees unprecedented growth in Q4
                    </h3>
                    <p className="text-gray-600 font-serif text-sm leading-relaxed mb-2">
                      Experts attribute the surge to rapid adoption of AI tools across enterprise workflows...
                    </p>
                    <span className="text-xs text-gray-400 font-sans uppercase">2h ago</span>
                  </div>
                  <div className="w-full md:w-48 h-32 bg-gray-200 shrink-0"></div>
                </article>
              ))}
            </div>
          </div>

          {/* Right Rail - 4 Cols */}
          <div className="md:col-span-4">
            <DailyBriefing />

            <div className="border-t border-black pt-1 mt-8">
              <h4 className="font-sans font-bold text-xs uppercase mb-3">Editors' Picks</h4>
              <ul className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex gap-3 group cursor-pointer">
                    <span className="text-2xl font-serif text-gray-300 font-bold">{i}</span>
                    <div>
                      <h4 className="font-serif font-bold group-hover:underline">The 100 Best Books of the 21st Century</h4>
                      <span className="text-xs text-gray-500 font-sans">Books</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </main>

      <footer className="bg-gray-100 border-t border-gray-300 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-blackletter text-3xl mb-4">The News Portal</h2>
          <div className="text-xs text-gray-500 font-sans">
            &copy; {new Date().getFullYear()} The News Portal. All rights reserved.
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs font-bold text-gray-600 uppercase">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Us</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
