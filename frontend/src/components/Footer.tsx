import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-4">WriteWave</h4>
            <p className="text-sm text-muted-foreground">
              Master Japanese writing with structured learning.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm">Learn</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/characters" className="hover:text-accent transition-colors">Characters</Link></li>
              <li><Link to="/vocabulary" className="hover:text-accent transition-colors">Vocabulary</Link></li>
              <li><Link to="/lessons" className="hover:text-accent transition-colors">Lessons</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/community" className="hover:text-accent transition-colors">Forums</Link></li>
              <li><Link to="/progress" className="hover:text-accent transition-colors">Progress</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm">About</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-accent transition-colors">Privacy</Link></li>
              <li><Link to="#" className="hover:text-accent transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2025 WriteWave. Free to use.
        </div>
      </div>
    </footer>
  );
};
