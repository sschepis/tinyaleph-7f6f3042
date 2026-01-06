import { Boxes, Github, ExternalLink, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Boxes className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-lg">
                <span className="text-primary">tiny</span>aleph
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              A novel computational paradigm that encodes meaning as prime number signatures, 
              embeds them in hypercomplex space, and performs reasoning through entropy minimization.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Modules</h4>
            <ul className="space-y-2">
              {['Core', 'Physics', 'Backends', 'Engine'].map(item => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.npmjs.com/package/@aleph-ai/tinyaleph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  npm Package
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  GitHub
                  <Github className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} @aleph-ai/tinyaleph. MIT License.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-destructive" /> for semantic computing
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
