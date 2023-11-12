import React, { useContext, useEffect, useState } from 'react';
import listCss from './css/List.module.css';
import { UserInfo } from './UserInfo';
import axios from 'axios';
import Cookies from 'js-cookie';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import InputMask from 'react-input-mask';

export default function List({ listContent, index }) {

  //console.log('index 1: ',index)

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [starts, setStarts] = useState('');
  const [ends, setEnds] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [detailsNotes, setDetailsNotes] = useState('');

  const currentListId = listContent?.listid; 
  const { userInfo, setUserInfo } = useContext(UserInfo);
  const [isAddTask, setIsAddTask] = useState(false)

  const [locationEditable, setLocationEditable] = useState(false)
  const [startsEditable, setStartsEditable] = useState(false)
  const [endsEditable, setEndsEditable] = useState(false)
  const [travelTimeEditable, setTravelTimeEditable] = useState(false)
  const [detailsNotesEditable, setDetailsNotesEditable] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  function setEditDetails(index) {
    switch(index) {
      case 1 :
        setLocationEditable(true)
        break;
      case 2 :
        setTravelTimeEditable(true)
        break;
      case 3 :
        setStartsEditable(true)
        break;
      case 4 :
        setEndsEditable(true)
        break;
      case 5 :
        setDetailsNotesEditable(true)
        break;
    }
  }

  // //console.log(isEditable)

  const allTasks = userInfo.listsTasks.flat().filter((task) => task !== null);
  const tasksForCurrentList = allTasks.filter((task) =>
    task.listid === currentListId
  );

  const [activeDetails, setActiveDetails] = useState([]);
  const [activeList, setActiveList] = useState(0);
  const [Default, setDefault] = useState(true)
  const [taskDone, setTaskDone] = useState(-1)

  useEffect(() => {
    setActiveDetails(tasksForCurrentList[0]);
    setActiveList(0);
    setDefault(listContent.isdefault)
    setIsAddTask(false)
    setTitle('')
    setLocation('')
    setStarts('')
    setEnds('')
    setTravelTime('')
    setDetailsNotes('')
    // setIsEditable(false)
    setLocationEditable(false)
    setStartsEditable(false)
    setEndsEditable(false)
    setTravelTimeEditable(false)
    setDetailsNotesEditable(false)

    setShowSaved(false)
  }, [listContent]);

  function dateFormat(date) {
    const newDateTime = date.split('T');
    const Date = newDateTime[0].replaceAll('-', '/');
    const Time = newDateTime[1].substring(0, 5);

    return Date + ' ' + Time;
  }

  function renderTasks() {

    // const sortedTasks = tasksForCurrentList.slice().sort((a, b) => {
    //   const dateA = new Date(a.from)
    //   const dateB = new Date(b.from)

    //   if (dateA > dateB) {
    //     return 1
    //   }

    //   if (dateA < dateB) {
    //     return -1
    //   }

    //   const timeA = dateA.getTime();
    //   const timeB = dateB.getTime();

    //   return timeA - timeB;
    // })

    if (tasksForCurrentList.length === 0) {
      return (
        <div className={listCss.empty1}>
          Add new tasks!
        </div>
      );
    }

    return tasksForCurrentList.map((task, index) => (
      <div
        className={`${listCss.list_Block} ${
          activeList === index ? listCss.activeLink : ''
        }`}
        key={task.taskid}
        onClick={() => setDetails(task, index)}
      >
        <button 
        className={`${listCss.todoDone_btn} ${
          taskDone === index ? listCss.taskDone : ''
        }`}
        onClick={() => doneTask(index)}
        ></button>
        <div className={listCss.todoInfo}>
          <p className={listCss.todoTitle}>{task.title}</p>
          <p className={listCss.todoDate}>
            {dateFormat(task.from)} to {dateFormat(task.to)}
          </p>
        </div>
      </div>
    ));
  }
  
  function doneTask(index) {
    setTaskDone(index); // Set the task as done immediately
  
    // Delay the deletion by 1.5 seconds
    setTimeout(() => {
      const taskToDelete = tasksForCurrentList[index];
      const taskid = taskToDelete.taskid;
  
      // Make a DELETE request to delete the task
      axios
        .delete(`http://localhost:8080/api/usersdata/delTask?taskid=${taskid}`)
        .then((response) => {
          if (response.status === 200) {
            //console.log('Task deleted successfully');
  
            // Filter out the deleted task from the current list of tasks
            const updatedTasks = tasksForCurrentList.filter(
              (task) => task.taskid !== taskid
            );
  
            const updatedUserInfo = {
              ...userInfo,
              listsTasks: userInfo.listsTasks.map((listTasks) =>
                listTasks.filter((task) => task.taskid !== taskid)
              ),
            };
  
            setUserInfo(updatedUserInfo);
            Cookies.set('userInfo', JSON.stringify(updatedUserInfo), {
              expires: 7,
            });
  
            // Update the taskDone state and clear the active details if necessary
            setTaskDone(-1);
            setActiveDetails(null);
          } else {
            console.error('Error deleting task');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }, 500);
  }  

  function setDetails(task, index) {

    //prevent travel time set to null when click on same task again
    if (index === activeList) {
      return
    }
    
    setActiveDetails(task);
    setActiveList(index);
    setIsAddTask(false)
    setTitle('')
    setLocation('')
    setStarts('')
    setEnds('')
    setTravelTime('')
    setDetailsNotes('')
    setLocationEditable(false)
    setStartsEditable(false)
    setEndsEditable(false)
    setTravelTimeEditable(false)
    setDetailsNotesEditable(false)
    setShowSaved(false)
  }

  useEffect(() => {
    // Update travelTime whenever activeDetails.traveltime changes
    if (activeDetails && activeDetails.traveltime) {
      setTravelTime(activeDetails.traveltime);
    }
  }, [activeDetails]);

  function setAddTask() {
    setIsAddTask(true)
    setActiveList(-1)
    setTravelTime('');
  }

  async function saveTask() {
    if (isAddTask) {
      if (!title || !starts || !ends) {
        // Validate that required fields are not empty
        alert('Title, Starts, and Ends are required.');
        return;
      }
    
      const formattedStarts = formatDateTime(starts);
      const formattedEnds = formatDateTime(ends);
    
      // Construct the URL with query parameters
      const addTaskUrl = `http://localhost:8080/api/usersdata/addtask?listid=${currentListId}&title=${encodeURIComponent(
        title
      )}&location=${encodeURIComponent(location)}&from=${formattedStarts}&to=${formattedEnds}&traveltime=${encodeURIComponent(
        travelTime
      )}&notes=${encodeURIComponent(detailsNotes)}`;
    
      try {
        // Make a POST request to add the task
        await axios.post(addTaskUrl);
    
        // Fetch the updated list of tasks
        const getListResponse = await axios.get('http://localhost:8080/api/usersdata', {
          params: {
            email: userInfo.userInfo[0].email,
            password: userInfo.userInfo[0].password,
          },
        });
    
        if (getListResponse.status === 200) {
          //console.log('Task added successfully');
        
          const updatedTasks = getListResponse.data.listsTasks.flat().filter((task) =>
            task.listid === currentListId
          );
        
          // Clear the form fields
          setTitle('');
          setLocation('');
          setStarts(null);
          setEnds(null);
          setTravelTime('');
          setDetailsNotes('');

          //console.log('userinfo before: ',userInfo)
          //console.log('index: ',index)
        
          // Replace the listsTasks array in userInfo with updatedTasks
          const updatedUserInfo = {
            ...userInfo,
            listsTasks: [
              ...userInfo.listsTasks.slice(0, index),
              updatedTasks,
              ...userInfo.listsTasks.slice(index + 1),
            ],
          };

          //console.log('userinfo after: ',updatedUserInfo)
        
          setUserInfo(updatedUserInfo);
          Cookies.set('userInfo', JSON.stringify(updatedUserInfo), {
            expires: 7,
          });
        } else {
          console.error('Error fetching updated tasks');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  async function modifyTask(taskid, title, modifiedLocation, modifiedStarts, modifiedEnds, modifiedTravelTime, modifiedDetailsNotes) {

    let formattedStarts = modifiedStarts
    let formattedEnds = modifiedEnds

    if (modifiedTravelTime == null) {
      modifiedTravelTime = ''
    }

    if (modifiedStarts === starts) {
      formattedStarts = formatDateTime(modifiedStarts);
    }
    if (modifiedEnds === ends) {
      formattedEnds = formatDateTime(modifiedEnds);
    }
    
    const modifyTaskUrl = `http://localhost:8080/api/usersdata/modifytask?taskid=${taskid}&title=${encodeURIComponent(
      title
    )}&location=${encodeURIComponent(modifiedLocation)}&from=${formattedStarts}&to=${formattedEnds}&traveltime=${encodeURIComponent(
      modifiedTravelTime
    )}&notes=${encodeURIComponent(modifiedDetailsNotes)}`;

    try {
      await axios.post(modifyTaskUrl)

      const getListResponse = await axios.get('http://localhost:8080/api/usersdata', {
          params: {
            email: userInfo.userInfo[0].email,
            password: userInfo.userInfo[0].password,
          },
        });
    
        if (getListResponse.status === 200) {
          //console.log('Task added successfully');
        
          const updatedTasks = getListResponse.data.listsTasks.flat().filter((task) =>
            task.listid === currentListId
          );
          //console.log(updatedTasks)
        
          // Clear the form fields
          setTitle('');
          setLocation('');
          setStarts(null);
          setEnds(null);
          setTravelTime('');
          setDetailsNotes('');

          setLocationEditable(false)
          setStartsEditable(false)
          setEndsEditable(false)
          setTravelTimeEditable(false)
          setDetailsNotesEditable(false)

          setActiveDetails(null)

          setShowSaved(true)

          setActiveList(-1)
        
          // Replace the listsTasks array in userInfo with updatedTasks
          const updatedUserInfo = {
            ...userInfo,
            listsTasks: [
              ...userInfo.listsTasks.slice(0, index),
              updatedTasks,
              ...userInfo.listsTasks.slice(index + 1),
            ],
          };

          //console.log(updatedUserInfo)
        
          setUserInfo(updatedUserInfo);
          Cookies.set('userInfo', JSON.stringify(updatedUserInfo), {
            expires: 7,
          });
        } else {
          console.error('Error fetching updated tasks');
        }

      
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // useEffect(()=> {
  //   console.log(userInfo)
  // }, [userInfo])

  const formatDateTime = (date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  const handleEndDateError = (date) => {
    if (date > starts) {
      setEnds(date);
    }
    else {
      alert('End can not be earlier than start.');
    }
  }

  //-------------------------------------------------------------------//

  return (
    <div className={listCss.activeList_conatainer}>
      <div className={listCss.tasks_container}>
        <div className={listCss.header_container}>
          <div className={listCss.headerIcon}></div>
          <p className={listCss.headerText}>
            {listContent ? listContent.listname : ''}
          </p>
        </div>

        <div className={listCss.list_container}>
          {renderTasks()}
        </div>

        <button className={listCss.addList_btn} onClick={setAddTask}>
          <div className={listCss.addIcon}></div>
          <p>Add a Task</p>
        </button>
      </div>

      <div className={listCss.details_container}>
          {
            isAddTask && (
              <>
              <div className={listCss.details}>
              <form>
                <p className={listCss.subtitle}>Title</p>
                <input
                  type="text"
                  className={listCss.details_content}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                ></input>

                <p className={listCss.subtitle}>Location</p>
                <input
                  type="text"
                  className={listCss.details_content}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                ></input>

                <p className={listCss.subtitle}>Travel Time</p>
                <InputMask
                  mask="99:99:99"
                  maskChar=""
                  className={listCss.details_content}
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                  placeholder='hh:mm:ss'
                />

                <p className={listCss.subtitle}>Starts</p>
                <div className={listCss.details_content}>
                  <DatePicker className={listCss.datepicker}
                    selected={starts}
                    onChange={(Date) => setStarts(Date)}
                    showTimeSelect
                    dateFormat="yyyy/MM/dd HH:mm"
                    required
                  />
                </div>

                <p className={listCss.subtitle}>Ends</p>
                <div className={listCss.details_content}>
                  <DatePicker className={listCss.datepicker}
                    selected={ends}
                    onChange={(Date) => handleEndDateError(Date)}
                    showTimeSelect
                    dateFormat="yyyy/MM/dd HH:mm"
                    required
                  />
                </div>
                

                <p className={listCss.subtitle}>Details / Notes</p>
                <textarea
                  className={listCss.details_notes}
                  rows="8"
                  value={detailsNotes}
                  onChange={(e) => setDetailsNotes(e.target.value)}
                ></textarea>
              </form>
              </div>
              <div className={listCss.saveBtn_container} onClick={saveTask}>Save</div>
              </>
            )
          }

          {!isAddTask && activeDetails && (
            <>
            <div className={listCss.details}>
              <p className={listCss.details_title}>{activeDetails.title}</p>
              
              <p className={listCss.subtitle}>Location
              {
                locationEditable ? (<div className={listCss.edit_logo_black}></div>) : 
                (<div className={listCss.edit_logo} onClick={() => setEditDetails(1)}></div>)
              }
              </p>
              {
                locationEditable ? 
                (<input
                  type="text"
                  className={listCss.details_content}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                ></input>) : 
                (<input
                  type="text"
                  className={listCss.details_content}
                  value={activeDetails.location}
                ></input>)
              }

              <p className={listCss.subtitle}>Travel Time
              {
                travelTimeEditable ? (<div className={listCss.edit_logo_black}></div>) : 
                (<div className={listCss.edit_logo} onClick={() => setEditDetails(2)}></div>)
              }  
              </p>
              {
                travelTimeEditable ? 
                (<InputMask
                  mask="99:99:99"
                  maskChar=""
                  className={listCss.details_content}
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                  placeholder='hh:mm:ss'
                />) : 
                (<input
                  type="text"
                  className={listCss.details_content}
                  value={travelTime}
                ></input>)
              }

              <p className={listCss.subtitle}>Starts
              {
                startsEditable ? (<div className={listCss.edit_logo_black}></div>) : 
                (<div className={listCss.edit_logo} onClick={() => setEditDetails(3)}></div>)
              }
              </p>
              {
                startsEditable ? 
                (
                <div className={listCss.details_content}>
                  <DatePicker className={listCss.datepicker}
                    selected={starts}
                    onChange={(Date) => setStarts(Date)}
                    showTimeSelect
                    dateFormat="yyyy/MM/dd HH:mm"
                    required
                  />
                </div>) : 
                (<input
                  type="text"
                  className={listCss.details_content}
                  value={activeDetails.from ? dateFormat(activeDetails.from) : ''}
                ></input>)
              }

              <p className={listCss.subtitle}>Ends
              {
                endsEditable ? (<div className={listCss.edit_logo_black}></div>) : 
                (<div className={listCss.edit_logo} onClick={() => setEditDetails(4)}></div>)
              }
              </p>
              {
                endsEditable ? 
                (<div className={listCss.details_content}>
                  <DatePicker className={listCss.datepicker}
                    selected={ends}
                    onChange={(Date) => setEnds(Date)}
                    showTimeSelect
                    dateFormat="yyyy/MM/dd HH:mm"
                    required
                  />
                </div>) : 
                (<input
                  type="text"
                  className={listCss.details_content}
                  value={activeDetails.to ? dateFormat(activeDetails.to) : ''}
                ></input>)
              }
              
              <p className={listCss.subtitle}>Details / Notes
              {
                detailsNotesEditable ? (<div className={listCss.edit_logo_black}></div>) : 
                (<div className={listCss.edit_logo} onClick={() => setEditDetails(5)}></div>)
              }
              </p>
              {
                detailsNotesEditable ? 
                (<textarea
                  className={listCss.details_notes}
                  rows="8"
                  value={detailsNotes}
                  onChange={(e) => setDetailsNotes(e.target.value)}
                ></textarea>) : 
                (<textarea
                  className={listCss.details_notes}
                  rows="8"
                  value={activeDetails.notes}
                ></textarea>)
              }
              
              </div>
              <div className={listCss.saveBtn_container} onClick={() => {
                const modifiedLocation = location !== '' ? location : activeDetails.location;
                const modifiedStarts = starts !== '' ? starts : activeDetails.from;
                const modifiedEnds = ends !== '' ? ends : activeDetails.to;
                const modifiedTravelTime = travelTime !== '' ? travelTime : activeDetails.traveltime;
                const modifiedDetailsNotes = detailsNotes !== '' ? detailsNotes : activeDetails.notes;
              
                modifyTask(activeDetails.taskid, activeDetails.title, modifiedLocation, modifiedStarts, modifiedEnds, modifiedTravelTime, modifiedDetailsNotes);
              }}>Save</div>
              </>
          )}

          {
            showSaved && !activeDetails && !isAddTask &&
            <div className={listCss.empty}>
              Task saved!
            </div>
          }

          {
            !activeDetails && !isAddTask && !showSaved &&
            <div className={listCss.empty}>Nothing here...</div>
          }
      </div>
    </div>
  );
}
