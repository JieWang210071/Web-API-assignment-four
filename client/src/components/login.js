import React, { Component } from 'react';
import axios from 'axios';
import './style.css';

class Login extends Component {
    constructor(){
        super();
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e){
        this.setState(
            {
                [e.target.name]: e.target.value
            }
        )
    }

    handleOnClick(){
        console.log(111);
        // alert('wrong username or password');
        axios.post('/api/signin', {
            username: "jie",
            password: "123456"
          })
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
        });
    }

    

    render() {
        return (
            <div className="center">
                <div className="card">
                    <form>
                        <input
                            className="form-item"
                            placeholder="Username goes here..."
                            name="username"
                            type="text"
                            onChange={this.handleChange}
                        />
                        <input
                            className="form-item"
                            placeholder="Password goes here..."
                            name="password"
                            type="password"
                            onChange={this.handleChange}
                        />
                        <input
                            className="form-submit"
                            value="Login"
                            type="button"
                            onClick={()=>this.handleOnClick()}
                        />
                    </form>
                </div>
            </div>
        );
    }
}

export default Login;