import React, { useState, useEffect } from 'react';

const UserTestPage = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '' });
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    // Fetch all users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        setLoading(false);
    };

    // Add a new user
    const addUser = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: newUser.username,
                    email: newUser.email,
                    password_hash: newUser.password, // Ensure password is hashed on the server
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setMessage(`User added successfully with ID: ${result.id}`);
                fetchUsers(); // Refresh the user list
            } else {
                const errorData = await response.json();
                setMessage(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error adding user:', error);
            setMessage('Failed to add user.');
        }
        setLoading(false);
    };

    // Handle user login
    const loginUser = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const result = await response.json();
                setLoginMessage('Login successful!');
                setIsLoggedIn(true);
                setLoggedInUser(result.user);
            } else {
                const errorData = await response.json();
                setLoginMessage(`Error: ${errorData.error}`);
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setLoginMessage('Login failed. Please try again.');
            setIsLoggedIn(false);
        }
        setLoading(false);
    };

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>User Test Page</h1>

            {!isLoggedIn ? (
                <>
                    <h2>Login</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            loginUser();
                        }}
                        style={{ marginBottom: '20px' }}
                    >
                        <div>
                            <label>
                                Email:
                                <input
                                    type="email"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    required
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                Password:
                                <input
                                    type="password"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    required
                                />
                            </label>
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    {loginMessage && <p>{loginMessage}</p>}
                </>
            ) : (
                <>
                    <h2>Welcome, {loggedInUser?.username || 'User'}!</h2>
                    <button onClick={() => setIsLoggedIn(false)}>Log Out</button>
                </>
            )}

            <h2>All Users</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {users.map((user) => (
                        <li key={user.id}>
                            <strong>{user.username}</strong> ({user.email}) - Registered on: {new Date(user.created_at).toLocaleString()}
                        </li>
                    ))}
                </ul>
            )}

            <h2>Add a New User</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    addUser();
                }}
                style={{ marginBottom: '20px' }}
            >
                <div>
                    <label>
                        Username:
                        <input
                            type="text"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Email:
                        <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Password:
                        <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            required
                        />
                    </label>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add User'}
                </button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
};

export default UserTestPage;
