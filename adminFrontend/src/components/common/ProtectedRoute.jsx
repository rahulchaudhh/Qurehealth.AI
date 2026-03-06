import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.spinner}></div>
                <p style={styles.text}>Loading...</p>
            </div>
        );
    }

    if (!user) {
        // Not authenticated → go to unified landing page
        window.location.replace('http://localhost:5173');
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Wrong role → go to landing page
        window.location.replace('http://localhost:5173');
        return null;
    }

    return children;
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
    },
    text: {
        marginTop: '20px',
        color: '#666',
        fontSize: '16px'
    }
};

// Add CSS animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ProtectedRoute;
