// Single unified login — redirect to patient portal login page
// which handles all roles: patient, doctor, admin
import { useEffect } from 'react';

function Login() {
    useEffect(() => {
        window.location.replace('http://localhost:5173/login');
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f9fafb',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '40px', height: '40px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #4f46e5',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 12px'
                }}></div>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Redirecting to login...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
}

export default Login;
