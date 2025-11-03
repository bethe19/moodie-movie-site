import { Github, Send } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-background/80 backdrop-blur-sm border-t border-border/40">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © 2025 · Made by{' '}
            <span className="text-accent font-semibold">Bethe</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://t.me/bethe19"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors group"
            >
              <Send className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>@bethe19</span>
            </a>
            <a
              href="https://github.com/bethe19"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors group"
            >
              <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>bethe19</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
