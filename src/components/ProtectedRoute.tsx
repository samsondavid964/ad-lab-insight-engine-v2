import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { session, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!session) {
        // Redirect them to the /auth page, but save the current location they were trying to go to
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    const email = session.user?.email || "";
    if (!email.endsWith("@ad-lab.io")) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 space-y-4 text-center">
                <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
                <p className="text-slate-600 max-w-md">
                    This application is restricted to authorized ad-lab.io team members only.
                    The email ({email}) is not authorized.
                </p>
                <button
                    onClick={() => {
                        // we will let the user sign out
                        import("@/integrations/supabase/client").then(({ supabase }) => {
                            supabase.auth.signOut().then(() => {
                                window.location.href = "/auth";
                            });
                        });
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Sign Out & Try Again
                </button>
            </div>
        );
    }

    return <>{children}</>;
};
