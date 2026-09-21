import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');

    let user = {};
    if (rawUser) {
        try {
            user = JSON.parse(rawUser);
        } catch {
            user = {};
        }
    }

    const normalizedRoles = Array.isArray(allowedRoles)
        ? allowedRoles
        : allowedRoles ? [allowedRoles] : [];

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (normalizedRoles.length > 0 && !normalizedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;