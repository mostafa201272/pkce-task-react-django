// Libs
import React, { useState } from "react";
import axios from 'axios';
import queryString from "query-string";
import CryptoJS from 'crypto-js';

// import styles
import loginStyles from './Login.module.css'

const Login = () => {

    // STATES
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState('');
    const [codeVerifier, setCodeVerifier] = useState('');
    const [codeChallenge, setCodeChallenge] = useState('');
    const [pkceState, setPkceState] = useState('');

    // Handle Inputs [Username, password]
    const handleUsername = (e) => { setUsername(e.target.value)};
    const handlePassword = (e) => { setPassword(e.target.value)};

    // Generate Randome Code
    const generateRandomCode = (length) =>{
        // Define temp code verifier
        let code = '';

        // Generation characters [A-Z, a-z, 0-9]
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        
        // Generate Sequence of characters
        for (let i = 0; i < length; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Return the random code
        return code
    }


    // Generate PKCE State
    const generatePkceState = () => {

        // Set the PKCE state in the state object
        setPkceState(generateRandomCode(128));

    };

    // Generate Code Verifier
    const generateCodeVerifier = () => {

        // set the code verifier value
        setCodeVerifier(generateRandomCode(256));

    };

    // Generate Code Challenge [Hash Code Verifier]
    const generateCodeChallenge = () => {
        setCodeChallenge(CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Base64));
        console.log(codeChallenge)
    };


    // Submit Request Handler
    const handleSubmit = async (e) => {
        
        // Prevent submit behvioue
        e.preventDefault();
        
        // check if user name or password id empty
        if (!username || !password) {
          setError('Please enter a username and password');
          return;
        }
        
        // Generate PKCE required attributes [PKCE State, Code Verifier, code Challange]
        generatePkceState();
        generateCodeVerifier();
        generateCodeChallenge();
        
        console.log(pkceState)
        console.log(codeVerifier)
        console.log(codeChallenge)

        try {

            const authorizationCodeResponse = await axios.get("http://127.0.0.1:8000/api/get-authorization-code/?" +
                queryString.stringify({
                response_type: "code",
                client_id: "dot-PKCE-client",
                redirect_uri: "http://127.0.0.1:3000/callback",
                code_challenge: codeChallenge,
                code_challenge_method: "S256",
                state:pkceState,
                })
            );
            
            // Get the returned Auth code
            const { code } = queryString.parse(authorizationCodeResponse.request.responseURL.split("?")[1]);
                
            // send post request to get the access token
            const tokenResponse = await axios.get("http://127.0.0.1:8000/api/get-access-token/", 
                queryString.stringify({
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: "http://127.0.0.1:3000/callback",
                    client_id: "dot-PKCE-client",
                    code_verifier: codeVerifier,
                }), 
                {
                    headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            // fetch the access token
            const { access_token } = tokenResponse.data;

            // display the access token
            setIsLoggedIn(access_token)
            
          } catch (err) {

            // returned error
            setError(err);
          }

      };

    return (
        <>
        
            <div className={`${loginStyles['login-form']}`}>
                
                <form onSubmit={handleSubmit}>


                    <div className="row">

                        {/* Display login alert error */}
                        { error && <div className="alert alert-danger">{error.toString()}</div>}

                        {/* Display login alert error */}
                        { isLoggedIn && <div className="alert alert-success">You Access Token is: {isLoggedIn.toString()}</div>}

                        
                        {/* <!-- START OF FORM ITEM --> */}
                        <div className="col-md-12 mb-3">
                            <label htmlFor="username" name='username' className="form-label">Username</label>
                            <input type="text" name='username' onChange={handleUsername} className="form-control" id="username" placeholder="Username" />
                        </div>
                        {/* <!-- END OF FORM ITEM --> */}

                        {/* <!-- START OF FORM ITEM --> */}
                        <div className="col-md-12 mb-3">
                            <label htmlFor="password" name='password' className="form-label">Password</label>
                            <input type="password" name='password' onChange={handlePassword} className="form-control" id="password" placeholder="Password" />
                        </div>
                        {/* <!-- END OF FORM ITEM --> */}


                        {/* <!-- START OF FORM ITEM --> */}
                        <div className={`col-md-12 mb-3 ${loginStyles['form-buttons']}`}>
                            <button type="submit" className={`btn ${loginStyles['custom-btn']}`}>
                                <span>Login</span>
                            </button>
                        </div>
                        {/* <!-- END OF FORM ITEM -->    */}

                    </div>


                </form>

            </div>
            
        </>
    );

}

export default Login;