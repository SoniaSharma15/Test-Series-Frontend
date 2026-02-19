import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const dashboardLink =
    user?.role === "admin"
      ? "/admin/dashboard"
      : "/student/dashboard";

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-indigo-600 text-white flex items-center justify-center rounded-lg font-semibold">
            BT
          </div>
          <h3 className="text-lg font-semibold text-gray-800 hidden sm:block">
            The Brilliant Bihar Test Series
          </h3>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-gray-600 hover:text-indigo-600 font-medium transition"
          >
            Home
          </Link>

          {user && (
            <Link
              to={dashboardLink}
              className="text-gray-600 hover:text-indigo-600 font-medium transition"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right Section (Desktop) */}
        <div className="hidden md:flex items-center gap-5">
          {!user ? (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-indigo-600 font-medium transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-full font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="text-gray-800 font-medium">{user.name}</p>
                  <p className="text-gray-500 capitalize text-xs">
                    {user.role}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex items-center"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-4 shadow-sm">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block text-gray-600 hover:text-indigo-600 font-medium"
          >
            Home
          </Link>

          {user && (
            <Link
              to={dashboardLink}
              onClick={() => setIsOpen(false)}
              className="block text-gray-600 hover:text-indigo-600 font-medium"
            >
              Dashboard
            </Link>
          )}

          {!user ? (
            <>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-gray-600 hover:text-indigo-600 font-medium"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition text-center"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <div className="border-t pt-4">
                <p className="text-gray-800 font-medium">{user.name}</p>
                <p className="text-gray-500 text-sm capitalize">
                  {user.role}
                </p>
              </div>

              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="block text-indigo-600 font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
