import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import './AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <TopNav />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
