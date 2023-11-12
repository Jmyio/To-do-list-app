import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './css/App.css'
import Login from './Login'
import Home from './Home'
import { UserInfo } from './UserInfo'
import { useState } from 'react'
import Cookies from 'js-cookie';

function App() {

  const userInfoCookie = Cookies.get('userInfo');
  
  let parsedUserInfo = []

  if (userInfoCookie != undefined) {
    parsedUserInfo = JSON.parse(userInfoCookie);
  }

  const [userInfo, setUserInfo] = useState(parsedUserInfo);

  return (
    <BrowserRouter>

      <UserInfo.Provider value={{userInfo, setUserInfo}}>

      <Routes>
        <Route path='/taskflow/login' element={<Login/>}></Route>
        <Route path='/taskflow/todohome/:username' element={<Home/>}></Route>
      </Routes>

      </UserInfo.Provider>
    </BrowserRouter>
  )
}

export default App
