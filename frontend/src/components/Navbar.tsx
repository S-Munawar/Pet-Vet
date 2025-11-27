import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>

      {user && user.role === 'pet_owner' && (
        <>
          <Link to="/add-pet">Add Pet</Link>
          <Link to="/select-pet">Select Pet</Link>
          <Link to="/pets/history">Pet History</Link>
        </>
      )}

      {user && user.role === 'admin' && (
        <Link to="/admin">Admin Dashboard</Link>
      )}

      {user ? (
        <>
          <span>Hi, {user.name}</span>
          <button onClick={handleLogout}>Logout</button>
          <Link to="/profile">Profile</Link>
        </>
      ) : (
        <>
          <Link to="/login">Log in</Link>
          <Link to="/register">Sign up</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
