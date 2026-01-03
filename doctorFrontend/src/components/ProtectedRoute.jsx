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
        return <Navigate to="/login" replace />;
    }

    // Doctor frontend only has doctors (and maybe admin?), but mainly doctors.
    // If we want to strictly enforce 'doctor' role:
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If user is logged in but not a doctor, what to do?
        // Maybe show unauthorized or logout?
        // For now, redirect to login might loop if we don't clear session.
        // Let's assume if they are in doctor app, they should be doctor.
        return <Navigate to="/login" replace />;
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
