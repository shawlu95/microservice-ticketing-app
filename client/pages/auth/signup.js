import { useState } from "react";
import axios from "axios";

// Accessible at https://ticketing.dev/auth/signup
const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);

  const onSubmit = async (event) => {
    // Do not reload page
    event.preventDefault();

    try {
      // Create a new user, should see cookie in browser
      const res = await axios.post('/api/users/signup', {
        email, password
      });
      console.log(res.data);
    } catch (err) {
      setErrors(err.response.data.errors);
    }
  };

  return ( 
    <form onSubmit={onSubmit}>
      <h1>Sign Up</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          className="form-control" />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          type="password" 
          className="form-control" />
      </div>
      {errors.length > 0 && <div className="alert alert-danger">
        <h4>Ooops...</h4>
        <ul className="my-0">
          {errors.map(err => <li key={err.message}>{err.message}</li>)}
        </ul>
      </div>}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  )
};

export default Signup;