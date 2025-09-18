import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Card, CardHeader, Button, Subtitle1 } from '@fluentui/react-components';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const goTypes = () => { console.debug('[AdminPage] Navigating to /admin/container-types'); navigate('/admin/container-types'); };
  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <h1>Admin</h1>
      <p>Welcome {user?.username}. Choose an administrative topic.</p>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
        <Card>
          <CardHeader header={<Subtitle1>Container Types</Subtitle1>} />
          <p style={{ marginTop: 0 }}>View available File Storage container types configured in your tenant.</p>
          <Button appearance="primary" onClick={goTypes}>View Container Types</Button>
          <div style={{ marginTop: '.5rem' }}>
            <Link to="/admin/container-types" style={{ fontSize: '.75rem', textDecoration: 'underline' }}>Open Container Types (fallback link)</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
