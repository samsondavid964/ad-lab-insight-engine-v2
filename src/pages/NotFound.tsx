import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #080c18 0%, #0f172a 50%, #080c18 100%)" }}>
      <div className="text-center animate-fade-in">
        {/* Large 404 with gradient */}
        <h1 className="text-[120px] md:text-[160px] font-extrabold leading-none tracking-tighter mb-2"
          style={{
            background: "linear-gradient(135deg, hsl(213 94% 55% / 0.3), hsl(213 94% 55% / 0.08))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Playfair Display', serif"
          }}>
          404
        </h1>
        <p className="text-lg text-slate-400 mb-2 font-medium">Page not found</p>
        <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 h-11">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
