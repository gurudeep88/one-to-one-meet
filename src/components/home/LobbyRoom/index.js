import { Box } from '@material-ui/core'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getToken, trimSpace } from '../../../utils';
import { localTrackMutedChanged } from '../../../store/actions/track';
import SnackbarBox from '../../shared/Snackbar';
import { showNotification } from '../../../store/actions/notification';
import SariskaMediaTransport from 'sariska-media-transport/dist/esm/SariskaMediaTransport';
import { addConnection } from '../../../store/actions/connection';
import { setDisconnected } from '../../../store/actions/layout';
import { addConference } from '../../../store/actions/conference';
import { setMeeting, setProfile } from '../../../store/actions/profile';
import Meeting from '../../../views/Meeting';
import JoinTrack from '../JoinTrack';

const LobbyRoom = ({tracks}) => {
  const [state, setState] = useState({
    audio: 'Mute Audio',
    video: 'Mute Video',
    meetingName: '',
    userName: '',
    submit: 'Start Conference'
  });
  const profile = useSelector((state) => state.profile);
  const notification = useSelector((state) => state.notification);
  const conference = useSelector(state => state.conference);

  const audioTrack = tracks.find(track => track?.isAudioTrack());
  const videoTrack = tracks.find(track => track?.isVideoTrack());

  const dispatch = useDispatch();

  const handleChange = async(e, type) => {
    if(type === 'audio'){
      if(state.audio === 'Mute Audio') {
        await audioTrack?.mute();
        dispatch(localTrackMutedChanged())
        setState(state => ({...state, audio: 'Unmute Audio'}));
      }else{
        await audioTrack.unmute();
        dispatch(localTrackMutedChanged())
        setState(state => ({...state, audio: 'Mute Audio'}));
      }
    }
    if(type === 'video'){
      if(state.video === 'Mute Video') {
        await videoTrack.mute();
        dispatch(localTrackMutedChanged())
        setState(state => ({...state, video: 'Unmute Video'}));
      }else{
        await videoTrack.unmute();
        dispatch(localTrackMutedChanged())
        setState(state => ({...state, video: 'Mute Video'}));
      }
    }
    const {name, value} = e.target;
    if(name === 'meetingName' || name === 'userName'){
      setState(state => ({...state, [name]:name === 'meetingName' ? trimSpace(value.toLowerCase()) : value}))
    }
  }

  let height = document.documentElement.clientHeight/ 2;
  let width = height * 16 / 9;
  let minHeight = '180px'; 
  let minWidth = minHeight * 16/9;

const handleSubmit = async(e) => {
  e.preventDefault();
  if(!state.meetingName){
    dispatch(showNotification({
      message: "Meeting Title is required",
      severity: "warning",
      autoHide: true,
    }))
    return;
  }
  if(!state.meetingName || !state.userName){
    dispatch(showNotification({
      message: "User name is required",
      severity: "warning",
      autoHide: true,
    }))
    return;
  }

  //get token
  const token = await getToken(profile, state.userName);
  //create connection
  const connection = await new SariskaMediaTransport.JitsiConnection(
    token,
    state.meetingName,
    false
  )
  
  //add connection event listener
  connection.addEventListener(SariskaMediaTransport.events.connection.CONNECTION_ESTABLISHED, async()=>{
    dispatch(addConnection(connection));
    //create conference when connection is established
    await createConference(connection);
  });
  connection.addEventListener(SariskaMediaTransport.events.connection.CONNECTION_FAILED, async(error)=>{
    console.log("CONNECTION_DROPPED_ERROR", error);
    if(error === SariskaMediaTransport.errors.connection.PASSWORD_REQUIRED){
      const token = await getToken(profile, state.meetingName);
      connection.setToken(token); // token expired, set a new token
    }
    if(error === SariskaMediaTransport.errors.connection.CONNECTION_DROPPED_ERROR){
      dispatch(setDisconnected("lost"));
    }
  })
  connection.addEventListener(
    SariskaMediaTransport.events.connection.CONNECTION_DISCONNECTED,
    (error) => {
      console.log("connection disconnect!!!", error);
    }
  );

  //connect the connection
  connection.connect();
}

const createConference = async(connection) => {
  const conference = await connection.initJitsiConference();
  //add local tracks to conference
  tracks.forEach(async(track) => await conference.addTrack(track));

  //add conference event listener
  conference.addEventListener(SariskaMediaTransport.events.conference.CONFERENCE_JOINED, () =>{ // local user about himself
    dispatch(addConference(conference));
    dispatch(setProfile(conference.getLocalUser())) //saves local user details to profile state.
    dispatch(setMeeting(state.meetingName));
  });
  conference.addEventListener(
    SariskaMediaTransport.events.conference.CONFERENCE_ERROR,
    (error) => {
      console.log('conference failed', error);
    }
  ); 

  //join the conference
  conference.join();
}

  return (
      <Box sx={{mt: 2}}>
        {
        !conference ? 
          <JoinTrack 
            width ={width} 
            height={height} 
            minHeight={minHeight} 
            minWidth={minWidth} 
            videoTrack={videoTrack}
            tracks={tracks}
            state={state}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
        :
          <Meeting />
      }
      <SnackbarBox notification={notification} />
      </Box>
  )
}

export default LobbyRoom