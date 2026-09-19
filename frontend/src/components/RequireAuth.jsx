import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Redirige a /login sin sesión, o a /seleccionar-tienda si falta elegir tienda
function RequireAuth({ children }) {
  const { user, store } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!store) {
    return <Navigate to="/seleccionar-tienda" replace />;
  }

  return children;
}

export default RequireAuth;
