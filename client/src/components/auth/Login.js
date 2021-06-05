import React, { Fragment, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = () => {

    //Creating Hook
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const {email, password} = formData;

    //Updating the state hook:
    const onChange = e => setFormData({...formData, [e.target.name]: e.target.value});

    const onSubmit = async e => {
        e.preventDefault();
        const newUser = {
            email: email,
            password: password
        }

        try {
            const config = {
                headers: {
                    "Content-Type": "application/json"
                }
            }
            //Converting user fields from inputs to JSON
            const body = JSON.stringify(newUser);
            
            //Sending JSON newUser object request to the API to get response object, which contains auth token
            await axios.post('/api/users', body, config);
        }

        catch(err) {
            console.log(err.response.data);
        }
    }

    return (
        <Fragment>
            <section className="container">
      <h1 className="large text-primary">Sign In</h1>
      <p className="lead"><i className="fas fa-user"></i> Sign Into your Account</p>
      <form className="form" onSubmit={e => onSubmit(e)}>
        <div className="form-group">
          <input type="email" placeholder="Email Address" name="email" value={email} onChange={e => onChange(e)} required/>
          <small className="form-text">This site uses Gravatar so if you want a profile image, use a
            Gravatar email</small>
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            minLength="6"
            value={password} onChange={e => onChange(e)} 
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Login" />
      </form>
      <p className="my-1">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </section>
        </Fragment>
    )
}

export default Login;
