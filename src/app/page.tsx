import { ArrowLeftCircle, FileText, Users, Sparkles } from "lucide-react";

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
    <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="shrink-0 p-2 bg-purple-100 text-purple-600 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

// ============================================================================
// HOME PAGE
// ============================================================================

export default function HomePage() {
  return (
    <main className="flex-1 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Welcome Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ArrowLeftCircle className="w-10 h-10 text-purple-500 animate-pulse" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome to Spaces
            </h1>
          </div>

          <p className="text-gray-600 text-lg">
            Get started by creating a new document from the sidebar, or select
            an existing one to continue editing.
          </p>
        </section>

        {/* Features Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            What you can do
          </h2>

          <div className="grid gap-4">
            <FeatureCard
              icon={<FileText className="w-5 h-5" />}
              title="Create Documents"
              description="Write and organize your thoughts with a powerful block-based editor."
            />

            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="Collaborate in Real-time"
              description="Invite team members and edit together with live cursors and presence."
            />

            <FeatureCard
              icon={<Sparkles className="w-5 h-5" />}
              title="AI-Powered Features"
              description="Translate documents and ask questions using multiple AI models."
            />
          </div>
        </section>
      </div>
    </main>
  );
}
