export const Footer = () => {
  return (
    <footer className="mt-12 py-6 border-t border-border">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Created by{' '}
          <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FNuzhdin
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          © {new Date().getFullYear()} Item Flow Manager
        </p>
      </div>
    </footer>
  );
};