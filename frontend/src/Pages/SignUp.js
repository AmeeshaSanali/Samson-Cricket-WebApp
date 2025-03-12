import React, { useState } from 'react';
import axios from 'axios';
import './SignUp.css'; 
import SignHeader from '../Components/SignHeader/signHeader';

const SignUp = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
    });

    const {firstname, lastname, email, password } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/users/register', formData);
            console.log('User  registered:', response.data);
            // Handle successful registration (e.g., redirect or show message)
        } catch (error) {
            console.error('Error registering user:', error.response.data);
            // Handle error (e.g., show error message)
        }
    };

    return (
        <div className="signup-bg">
            <SignHeader />
            <div className="signup-wrapper">
                <h2>Create an Account for Samson Cricket</h2>
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input 
                            type="text" 
                            name="firstname" 
                            value={firstname} 
                            onChange={handleChange} 
                            placeholder="First Name" 
                            required 
                            className="input-field"
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="text" 
                            name="lastname" 
                            value={lastname} 
                            onChange={handleChange} 
                            placeholder="Last Name" 
                            required 
                            className="input-field"
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="email" 
                            name="email" 
                            value={email} 
                            onChange={handleChange} 
                            placeholder="Email" 
                            required 
                            className="input-field"
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="password" 
                            name="password" 
                            value={password} 
                            onChange={handleChange} 
                            placeholder="Password" 
                            required 
                            className="input-field"
                        />
                    </div>
                    <button type="submit" className="signup-button">Sign Up</button>
                    <div className="signIn">
                <p>Already user?</p>
                <a href='/signIn'>Sign In</a>
                </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;