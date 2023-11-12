import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import homeCss from './css/Home.module.css'
import List from './List';
import { UserInfo } from './UserInfo';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function Home() {

  const defaultIcons = [
    {classname : 'todayIcon'},
    {classname : 'sevenDaysIcon'}, 
    {classname : 'importantIcon'},
    {classname : 'archiveIcon'}
  ]

  const param = useParams()
  const { userInfo, setUserInfo } = useContext(UserInfo)
  const [activeList, setActiveList] = useState(1)
  const [showList, setShowList] = useState(true)
  const [activeContent, setActiveContent] = useState(userInfo.lists[0])
  const [activeContentIndex, setActiveContentIndex] = useState(0)//was set at 1, so made duplicate tasks bug
  const [isEdit, setIsEdit] = useState(false)
  const [listName, setListName] = useState('')
  const [isAddList, setIsAddList] = useState(false)
  const navigation = useNavigate()


  const defaultList = userInfo.lists.filter(list => list.isdefault) || [];

  function renderDefaultList() {
    return defaultList.map((list, index) => (
      <button
        key={list.listid}
        onClick={() => clicked(index + 1, list)}
        className={`${homeCss.defaultList_Block} ${
          activeList === index + 1 ? homeCss.activeLink : ''
        }`}
      >
        <div className={homeCss[defaultIcons[index]?.classname || '']}></div>
        <p>{list.listname}</p>
      </button>
    ))
  }

  function renderCustomList() {
    const customList = userInfo.lists.filter(list => !list.isdefault) || [];
    return customList.map((list, index)=> (
      <button
        key={list.listid}
        onClick={() => clicked(index + 5, list)}
        className={`${homeCss.defaultList_Block} ${
          activeList === index + 5 ? homeCss.activeLink : ''
        }`}
      >
        {isEdit && activeList === index + 5 ? (
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className={homeCss.editBox}
            placeholder='Enter New Name'
            onKeyDown={(e) => handleKeyDown(e, list.listid)}
          />
        ) : (
          <p><span className={homeCss.listdot}>• </span>{list.listname}</p>
        )}

        {
          activeList === index + 5 &&
          <>
            <div
              className={homeCss.editBtn}
              style={{
                backgroundImage: `url(/public/img/main-page-img/edit.png)`,
              }}
              onClick={setEditMode}
            ></div>
            <div
              className={homeCss.deleteBtn}
              style={{
                backgroundImage: `url(/public/img/main-page-img/delete.png)`,
              }}
              onClick={()=>handleDelList(list.listid)}
            ></div>
          </>
        }
      </button>
    ))
  }

  function clicked(index, content) {
    setActiveList(index)
    setActiveContentIndex(index-1)
    setActiveContent(content)
    setIsAddList(false)
  }

  function renderSelectedList() {
    return <List listContent={activeContent} index={activeContentIndex} />;
  }

  function showCustomList() {
    setIsAddList(false)
    setShowList(!showList)
  }

  function handleKeyDown(e, listid) {
    if (e.key === 'Enter') {
      if(listName === '') {
        setIsEdit(false)
      }
      else {
        axios
        .post(`http://localhost:8080/api/usersdata/modifytodolist?listid=${listid}&listname=${listName}`)
        .then((response) => {
          if (response.status === 200) {
            console.log('List name updated successfully');

            const updatedUserInfo = {
              ...userInfo,
              lists: userInfo.lists.map((list) => {
                if (list.listid === listid) {
                  return { ...list, listname: listName };
                }
                return list;
              }),
            };
            
            setUserInfo(updatedUserInfo);

            console.log(updatedUserInfo)

            Cookies.set('userInfo', JSON.stringify(updatedUserInfo), { expires: 7 });

            setIsEdit(false);
            setListName('')
          } else {
            console.error('Error updating list name');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }
    }
  }

  function handleKeyDown2(e, userid) {
    if (e.key === 'Enter') {
      if (listName === '') {
        setIsAddList(false);
      } else {
        axios
          .post(`http://localhost:8080/api/usersdata/addtodolist?listname=${listName}&userid=${userid}`)
          .then(async (response) => {
            if (response.status === 200) {
              console.log('List added successfully');
  
              // Make a GET request to fetch the updated list of lists
              const getListResponse = await axios.get('http://localhost:8080/api/usersdata', {
                params: {
                  email: userInfo.userInfo[0].email, // Replace with the email parameter you are using
                  password: userInfo.userInfo[0].password, // Replace with the password parameter you are using
                }
              });
              
              // Update userInfo state with the new list data from the server response
              if (getListResponse.status === 200) {
                const updatedUserInfo = {
                  ...userInfo,
                  lists: getListResponse.data.lists, // Assuming the response structure has a "lists" property containing the updated list data
                };
                setUserInfo(updatedUserInfo);
                Cookies.set('userInfo', JSON.stringify(updatedUserInfo), { expires: 7 });
              }
  
              setIsAddList(false);
              setListName('');
              
            } else {
              console.error('Error adding list');
            }
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      }
    }
  }
  
  const handleDelList = async (listId) => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/usersdata/delToDoList?listid=${listId}`);
      if (response.status === 200) {
        console.log("List deleted successfully");

        const updatedUserInfo = {
          ...userInfo,
          lists: userInfo.lists.filter((list) => list.listid !== listId),
        };

        setUserInfo(updatedUserInfo);

        Cookies.set('userInfo', JSON.stringify(updatedUserInfo), { expires: 7 });

        setActiveList(1)
        setActiveContent(defaultList[0])

      } else {
        console.error("Error deleting list");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function setEditMode() {
    setIsEdit(true)
    setIsAddList(false)
  }

  function setAddList() {
    setIsAddList(true)
    setIsEdit(false)
  }

  const [showOptions, setShowOptions] = useState(false)

  function showOption() {
    setShowOptions(!showOptions)
  }

  function logout() {
    navigation(`/taskflow/login`);
    setUserInfo(null);
    Cookies.remove('userInfo');
  }

  return (
    <div className={homeCss.home_conatainer}>
      <div className={homeCss.navbar}>
        <div className={homeCss.userBlock} onClick={showOption}>
          <div className={homeCss.userIcon}>{param.username[0].toUpperCase()}</div>
          <div className={homeCss.userNameEmail}>        
            <p className={homeCss.userName}>{param.username}</p>
            <p className={homeCss.userEmail}>{userInfo.userInfo[0].email}</p>
          </div>
        </div>

        {
          showOptions &&
          <div className={homeCss.moreOptions}>
            <div className={homeCss.logout_block} onClick={logout}>
              <div className={homeCss.logoutBtn}></div>
              <p>Logout</p>
            </div>
          </div>
        }

        <div className={homeCss.searchBlock}>
          <input type='text' className={homeCss.searchBox} placeholder='Search'></input>
        </div>

        <div className={homeCss.defaultList_container}>

          {renderDefaultList()}

        </div>

        <div className={homeCss.customList_container}>
          <div className={homeCss.extendList_Block}>
            <div>
              <div className={homeCss.listsIcon}></div>
              <p>Lists</p>
            </div>

            <div className={homeCss.extendIcon} onClick={showCustomList}></div>
          </div>
          
          <div className={homeCss.customList}>
            
            {
              showList &&
              renderCustomList()
            }
            
          </div>
        </div>

        <div className={homeCss.addList_Block} onClick={setAddList}>
          <div className={homeCss.addIcon}></div>
          {
            !isAddList? 
            (<p>Add a List</p>) :
            (
              <input 
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className={homeCss.editBox}
                placeholder='Enter List Name'
                onKeyDown={(e) => handleKeyDown2(e, userInfo.userInfo[0].userId)}
              />
            )
          }
        </div>
      </div>
      
      {renderSelectedList()}
      
    </div>
  )
}
