import { FileText, Users, Sparkles, Zap, Globe, Shield } from "lucide-react";
import NewDocumentButton from "@/components/NewDocumentButton";

// ============================================================================
// FEATURE CARD
// ============================================================================

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-brand/30 hover:shadow-sm transition-all">
      <div className="shrink-0 p-3 bg-brand-muted text-brand rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ============================================================================
// HOME PAGE
// ============================================================================

export default function HomePage() {
  return (
    <main className="flex-1 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand to-brand/80">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNGMwIDItMiA0LTIgNHMtMi0yLTItNHoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-foreground mb-6 tracking-tight">
            Collaborate on Documents
            <br />
            <span className="text-brand-foreground/80">in Real-Time</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Write, edit, and brainstorm together with AI-powered features.
            Built for teams who value simplicity and speed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NewDocumentButton
              variant="secondary"
              size="lg"
              className="text-base px-8"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Everything you need to collaborate
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A powerful, minimal document editor with real-time collaboration
            and AI capabilities built in.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Block-Based Editor"
            description="Write and organize your thoughts with a powerful, intuitive editor. Support for headings, lists, code blocks, and more."
          />

          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Real-Time Collaboration"
            description="Invite team members and edit together with live cursors, presence indicators, and instant synchronization."
          />

          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI-Powered Features"
            description="Translate documents to 10+ languages and ask questions about your content using GPT-4, Claude, or Gemini."
          />

          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Lightning Fast"
            description="Built on modern infrastructure with optimistic updates and efficient synchronization for a snappy experience."
          />

          <FeatureCard
            icon={<Globe className="w-6 h-6" />}
            title="Access Anywhere"
            description="Your documents are always accessible from any device with a web browser. No installation required."
          />

          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Secure by Default"
            description="Role-based access control ensures only authorized team members can view or edit your documents."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Create your first document and experience seamless collaboration.
          </p>
          <NewDocumentButton size="lg" className="text-base px-8" />
        </div>
      </section>
    </main>
  );
}
