import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, MessageSquare, Search, FileText, Network, Sparkles, 
  BookOpen, Tags, AlertTriangle, Music, Gamepad2, Bot
} from "lucide-react";

const appIdeas = [
  {
    title: "Semantic Search Engine",
    description: "Build a search that understands meaning, not just keywords. Find documents by concept similarity even when exact terms don't match.",
    icon: Search,
    difficulty: "Beginner",
    tags: ["NLP", "Search", "Documents"],
    features: [
      "Query expansion using semantic neighbors",
      "Relevance ranking by coherence scores",
      "Typo-tolerant matching via prime encoding"
    ]
  },
  {
    title: "AI Chatbot with Memory",
    description: "Create a conversational agent that maintains semantic context across sessions using oscillator-based memory.",
    icon: Bot,
    difficulty: "Intermediate",
    tags: ["Chatbot", "Memory", "Context"],
    features: [
      "Long-term semantic memory storage",
      "Context retrieval via similarity search",
      "Personality consistency through state anchoring"
    ]
  },
  {
    title: "Concept Clustering Dashboard",
    description: "Visualize how ideas cluster together. Great for research, brainstorming, or organizing large document collections.",
    icon: Network,
    difficulty: "Intermediate",
    tags: ["Visualization", "Clustering", "Analysis"],
    features: [
      "Real-time Kuramoto synchronization",
      "Interactive 2D/3D projections",
      "Automatic topic detection"
    ]
  },
  {
    title: "Smart Note-Taking App",
    description: "Notes that automatically link related ideas, suggest connections, and surface relevant past entries.",
    icon: FileText,
    difficulty: "Beginner",
    tags: ["Productivity", "Notes", "PKM"],
    features: [
      "Auto-linking by semantic similarity",
      "Related notes sidebar",
      "Semantic search across all notes"
    ]
  },
  {
    title: "Content Recommendation System",
    description: "Recommend articles, products, or media based on deep semantic understanding of user preferences.",
    icon: Sparkles,
    difficulty: "Intermediate",
    tags: ["Recommendations", "E-commerce", "Media"],
    features: [
      "User taste modeling in sedenion space",
      "Cold-start handling via prime semantics",
      "Diversity-aware recommendations"
    ]
  },
  {
    title: "Plagiarism & Similarity Detector",
    description: "Detect conceptual similarity between texts, even when paraphrased or translated.",
    icon: AlertTriangle,
    difficulty: "Beginner",
    tags: ["Education", "Writing", "Analysis"],
    features: [
      "Paragraph-level similarity scoring",
      "Paraphrase detection",
      "Source attribution suggestions"
    ]
  },
  {
    title: "Automatic Tagging System",
    description: "Auto-generate tags and categories for content based on semantic analysis.",
    icon: Tags,
    difficulty: "Beginner",
    tags: ["CMS", "Organization", "Automation"],
    features: [
      "Tag suggestion from content",
      "Hierarchical category inference",
      "Tag co-occurrence analysis"
    ]
  },
  {
    title: "Reading List Curator",
    description: "Organize books and articles by conceptual themes. Discover unexpected connections in your reading history.",
    icon: BookOpen,
    difficulty: "Beginner",
    tags: ["Reading", "Books", "Curation"],
    features: [
      "Theme-based clustering",
      "Reading path suggestions",
      "Gap analysis (unexplored topics)"
    ]
  },
  {
    title: "Semantic Code Search",
    description: "Search codebases by what the code does, not just variable names. Find similar implementations across projects.",
    icon: Brain,
    difficulty: "Advanced",
    tags: ["Developer Tools", "Code", "Search"],
    features: [
      "Function similarity detection",
      "Cross-language concept matching",
      "Refactoring opportunity detection"
    ]
  },
  {
    title: "Music Mood Mapper",
    description: "Analyze and organize music by emotional/semantic content. Create playlists that flow naturally.",
    icon: Music,
    difficulty: "Advanced",
    tags: ["Music", "Emotion", "Playlists"],
    features: [
      "Lyric semantic analysis",
      "Mood trajectory in playlists",
      "Genre-independent similarity"
    ]
  },
  {
    title: "Interactive Story Engine",
    description: "Generate branching narratives where story elements maintain semantic coherence across paths.",
    icon: Gamepad2,
    difficulty: "Advanced",
    tags: ["Gaming", "Narrative", "Creative"],
    features: [
      "Plot consistency via entropy constraints",
      "Character relationship modeling",
      "Theme-aware branch generation"
    ]
  },
  {
    title: "Meeting Summarizer",
    description: "Extract key topics, decisions, and action items from meeting transcripts using semantic clustering.",
    icon: MessageSquare,
    difficulty: "Intermediate",
    tags: ["Productivity", "Meetings", "Summarization"],
    features: [
      "Topic segmentation",
      "Key point extraction",
      "Follow-up suggestion generation"
    ]
  }
];

const difficultyColors = {
  "Beginner": "bg-green-500/10 text-green-500 border-green-500/20",
  "Intermediate": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "Advanced": "bg-red-500/10 text-red-500 border-red-500/20"
};

const AppIdeas = () => {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4">
        <Badge variant="outline" className="mb-4">Documentation</Badge>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          App Ideas
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Inspiration for what you can build with TinyAleph. From simple utilities to complex AI applications.
        </p>
      </section>

      {/* Filter Legend */}
      <section className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <Badge className={difficultyColors["Beginner"]}>Beginner</Badge>
          <span className="text-sm text-muted-foreground">Good first project</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={difficultyColors["Intermediate"]}>Intermediate</Badge>
          <span className="text-sm text-muted-foreground">Some experience needed</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={difficultyColors["Advanced"]}>Advanced</Badge>
          <span className="text-sm text-muted-foreground">Complex implementation</span>
        </div>
      </section>

      {/* App Ideas Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appIdeas.map((app) => (
          <Card key={app.title} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <app.icon className="w-6 h-6 text-primary" />
                </div>
                <Badge className={difficultyColors[app.difficulty as keyof typeof difficultyColors]}>
                  {app.difficulty}
                </Badge>
              </div>
              <CardTitle className="mt-4">{app.title}</CardTitle>
              <CardDescription>{app.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex flex-wrap gap-1 mb-4">
                {app.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-auto">
                <p className="text-sm font-medium mb-2">Key Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {app.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Call to Action */}
      <section className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold">Ready to Build?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Check out the interactive examples to see TinyAleph in action, then dive into the reference guide for complete API documentation.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            to="/quickstart" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View Examples
          </Link>
          <Link 
            to="/docs/reference" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
          >
            API Reference
          </Link>
        </div>
      </section>

      {/* Navigation */}
      <section className="flex justify-between pt-8 border-t">
        <Link to="/docs/user-guide" className="text-muted-foreground hover:text-primary transition-colors">
          ← User Guide
        </Link>
        <Link to="/docs/reference" className="text-primary hover:underline">
          Reference Guide →
        </Link>
      </section>
    </div>
  );
};

export default AppIdeas;
