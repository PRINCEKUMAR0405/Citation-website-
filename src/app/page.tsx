import Link from "next/link";
import { BookOpen, Search, PenTool, Library, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-24 px-4">
        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-Powered Academic Citations
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Cite Smarter with <span className="text-primary">CiteAI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            The AI-powered academic citation assistant. Generate perfect citations in
            APA, MLA, Chicago, and Harvard formats instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/citations"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 font-semibold hover:bg-primary/90 transition-colors"
            >
              Start Citing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sources"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 font-semibold hover:bg-accent transition-colors"
            >
              Find Sources
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">Everything You Need</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            A complete suite of tools for academic research and writing
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                href: "/citations",
                icon: BookOpen,
                title: "Citation Generator",
                description: "Generate perfect citations in APA, MLA, Chicago, and Harvard formats",
                color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
              },
              {
                href: "/sources",
                icon: Search,
                title: "Source Finder",
                description: "Search and discover academic papers, books, and journals",
                color: "bg-green-500/10 text-green-600 dark:text-green-400",
              },
              {
                href: "/writing",
                icon: PenTool,
                title: "Writing Assistant",
                description: "AI-powered writing help with inline citation suggestions",
                color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
              },
              {
                href: "/bibliography",
                icon: Library,
                title: "Bibliography Manager",
                description: "Organize, edit, and export your citations and bibliographies",
                color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
              },
            ].map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group flex flex-col gap-4 rounded-xl border bg-card p-6 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why CiteAI */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CiteAI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Generate citations in seconds, not minutes" },
              { icon: Shield, title: "Always Accurate", desc: "AI-verified formatting following official style guides" },
              { icon: Sparkles, title: "AI-Powered", desc: "Smart suggestions and writing assistance" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 CiteAI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/citations" className="hover:text-foreground transition-colors">Citations</Link>
            <Link href="/sources" className="hover:text-foreground transition-colors">Sources</Link>
            <Link href="/bibliography" className="hover:text-foreground transition-colors">Bibliography</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
