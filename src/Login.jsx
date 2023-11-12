import React, { useContext, useEffect, useState } from 'react'
import loginCss from './css/Login.module.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserInfo } from './UserInfo';
import Cookies from 'js-cookie';

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('')
    const [loginFailed, setFailed] = useState(false);
    const navigation = useNavigate();
    const {userInfo, setUserInfo} = useContext(UserInfo);
    const [showSignUp, setShowSignUp] = useState(false);
    const [complete, setComplete] = useState(false)
    const [signUpFailed, setSignUpFailed] = useState(false)

    // useEffect(()=> {
    //     if (userInfo.userInfo && userInfo.userInfo.length > 0) {
    //         console.log(userInfo)
    //         const username = userInfo.userInfo[0].username;
    //         console.log('Username:', username);
    //         navigation(`/todohome/${username}`)
    //     }
    // }, [userInfo])

    function switchDiv() {
        setShowSignUp(!showSignUp)
        setComplete(false)
        setFailed(false)
        setSignUpFailed(false)
        setEmail('')
        setPassword('')
        setUsername('')
    }

    function switchDiv2() {
        setShowSignUp(false)
        setComplete(false)
        setFailed(false)
        setSignUpFailed(false)
        setEmail('')
        setPassword('')
        setUsername('')
    }

    function enterKey(e) {
        if (e.key === 'Enter') {
            handleLogin()
        }
    }

    function enterKey2(e) {
        if (e.key === 'Enter') {
            handleSignUp()
        }
    }

    const handleLogin = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/usersdata', {
                params: {
                    email: email,
                    password: password,
                },
            })

            if (response.status === 200 && response.data.userInfo) {
                const user = response.data;
                Cookies.set('authToken', response.data.token, { expires: 7 }); // 'expires' defines the cookie expiration in days
                Cookies.set('userInfo', JSON.stringify(user), { expires: 7 });

                setUserInfo(response.data);

                const username = response.data.userInfo[0].username;
                navigation(`/taskflow/todohome/${username}`);

                console.log(userInfo)
            }
            else {
                setFailed(true)
            }
        }
        catch(error) {
            console.error('Error:', error);
        }
    }

    useEffect(() => {
        const userSession = Cookies.get('userInfo');
    
        if (userSession) {
          const userInfo = JSON.parse(userSession);
    
          const { email, password } = userInfo.userInfo[0];
    
          // Set state values for email and password
          setEmail(email);
          setPassword(password);
        }
    }, []); // Empty dependency array to run the effect only once on mount

    if (Cookies.get('userInfo') && email && password) {
        handleLogin()
    }

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };
      
      const isValidPassword = (password) => {
        return password.length >= 8;
      };

    const handleSignUp = async() => {
        if (!isValidEmail(email) || !isValidPassword(password) || !username) {
            window.alert('Please enter a valid email and password (at least 8 characters).');
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/api/usersdata/createuserinfo', null, {
                params: {
                    email: email,
                    password: password,
                    username: username,
                },
            })

            if (response.status === 200) {
                setComplete(true)
                setShowSignUp(false)
                setFailed(false)
                setSignUpFailed(false)
                setEmail('')
                setPassword('')

                console.log('success')
            }
        }
        catch(error) {
            setSignUpFailed(true)
            console.error('Error:', error);
        }
    }

  return (
    <div className={loginCss.loginBlock_container}>
        <div className={loginCss.loginBlock}>
            <div className={loginCss.left_bg_container}></div>

            {
                complete && 
                <div className={loginCss.complete_container}>
                    <div className={loginCss.completeIcon}></div>
                    <p className={loginCss.complete_name}>Welcome {username}!</p>
                    <a onClick={switchDiv2}>Login Now</a>
                </div>
            }

            {
                showSignUp && !complete &&
                <div className={loginCss.signUp_container}>
                    <div className={loginCss.icon_container}>
                        <div className={loginCss.icon_signup}></div>
                        <p className={loginCss.icon_name}>Sign Up</p>
                    </div>

                    <div className={loginCss.signUpInput_container}>
                        {
                            signUpFailed &&
                            <p className={loginCss.loginFailed}>* email already in used</p>
                        } 
                        {
                            !signUpFailed &&
                            <p className={loginCss.loginFailedBlock}></p>
                        } 
                        <div className={loginCss.inputBlock}>
                            <p>Username :</p>
                            <input type='text' value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => enterKey2(e)}></input>
                        </div>
                        <div className={loginCss.spacing1}></div>
                        <div className={loginCss.inputBlock}>
                            <p>Email :</p>
                            <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => enterKey2(e)}></input>
                        </div>
                        <div className={loginCss.spacing1}></div>

                        <div className={loginCss.inputBlock}>
                            <p>Password :</p>
                            <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => enterKey2(e)}></input>
                        </div>

                        <div className={loginCss.spacing2}></div>
                        
                        <button className={loginCss.signUpBtn} onClick={handleSignUp}>Sign Up</button>
                        <p className={loginCss.loginLink}>Already have an account? <a onClick={switchDiv}>Login</a></p>
                    </div>
                </div>
            }

            {
                !showSignUp && !complete &&
                    <div className={loginCss.loginInfo_container}>
                        <div className={loginCss.loginInfo}>
                            <div className={loginCss.icon_container}>
                                <div className={loginCss.icon}></div>
                                <p className={loginCss.icon_name}>TaskFlow</p>
                            </div>

                            <div className={loginCss.inputBlock_container}>
                                {
                                    loginFailed &&
                                    <p className={loginCss.loginFailed}>* email or password incorrect</p>
                                } 
                                {
                                    !loginFailed &&
                                    <p className={loginCss.loginFailedBlock}></p>
                                } 
                                <div className={loginCss.inputBlock}>
                                    <p>Email :</p>
                                    <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => enterKey(e)}></input>
                                </div>

                                <div className={loginCss.spacing1}></div>

                                <div className={loginCss.inputBlock}>
                                    <p>Password :</p>
                                    <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => enterKey(e)}></input>
                                </div>

                                <div className={loginCss.spacing2}></div>

                                <button className={loginCss.loginBtn} onClick={handleLogin}>LOGIN</button>

                                <p className={loginCss.createLink}>New User? <a onClick={switchDiv}>Create Account</a></p>
                            </div>

                            <div className={loginCss.otherLogin_container}>
                                <div className={loginCss.orLine}>
                                    <div></div>
                                    <p>OR</p>
                                    <div></div>
                                </div>

                                <p className={loginCss.text}>Login with</p>

                                <div className={loginCss.loginLogos_container}>
                                    <div className={loginCss.loginLogo1}></div>
                                    <div className={loginCss.loginLogo2}></div>
                                    <div className={loginCss.loginLogo3}></div>
                                </div>
                            </div>
                        </div>
                    </div>
            }
        </div>
    </div>
  )
}
