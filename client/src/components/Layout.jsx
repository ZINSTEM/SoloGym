import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Nav from './Nav';

export default function Layout() {
  const { user } = useAuth();
  return (
    <>
      {user && <Nav />}
      <main className={user ? 'main-with-nav' : ''}>
        <Outlet />
      </main>
    </>
  );
}
