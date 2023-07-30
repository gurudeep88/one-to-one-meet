import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import SariskaMediaTransport from 'sariska-media-transport/dist/esm/SariskaMediaTransport';
import { addRemoteTrack, participantLeft, remoteTrackMutedChanged, removeRemoteTrack } from '../../store/actions/track';
import Home from '../Home';
import { Box, makeStyles } from '@material-ui/core';
import { color } from '../../assets/styles/_color';
import GridLayout from '../../components/meeting/GridLayout';
import ActionButtons from '../../components/meeting/ActionButtons';
import { setPresenter, setRaiseHand } from '../../store/actions/layout';
import { showNotification } from '../../store/actions/notification';
import SnackbarBox from '../../components/shared/Snackbar';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: color.secondaryDark,
    minHeight: 'calc(100vh - 16px)',
    minWidth: 'calc((100vh - 16px) * 16 / 9)'
  }
}))

const Meeting = () => {
  const classes = useStyles();
  const localTracks = useSelector((state) => state.localTrack);
  const conference = useSelector((state) => state.conference);
  const connection = useSelector((state) => state.connection);
  const layout = useSelector(state => state.layout);
  const notification = useSelector((state) => state.notification);
  const resolution = useSelector((state) => state.media?.resolution);
  const [dominantSpeakerId, setDominantSpeakerId] = useState(null);

  const dispatch = useDispatch();

  const destroy = async() => {
    if(conference?.isJoined()){
      await conference?.leave();
    }
    for(let track of localTracks){
      await track.dispose();
    }
    await connection?.disconnect();
  }

  useEffect(()=>{
    if(!conference){
      return;
    }
    
    //to save local participant properties into store or to show notification to self
    conference.getParticipantsWithoutHidden().forEach(participant => {
      if(participant._properties?.handraise === 'start'){
        dispatch(setRaiseHand({raiseHand: true, participantId: participant._id}))
      }
      if(participant._properties?.presenting === 'start'){
        dispatch(
          showNotification({
            autoHide: true,
            message: `Screen sharing is being presenting by ${participant._identity?.user?.name}`,
          })
        );
        dispatch(setPresenter({ participantId: participant._id, presenter: true }));
      }
    })

    // let other participant know that the remote participant have change his local property. and the local participant can 
    // show on his end this by saving the state into his side of reducer.
    conference.addEventListener(SariskaMediaTransport.events.conference.PARTICIPANT_PROPERTY_CHANGED, 
      (participant, key, oldValue, newValue)=>{
        if(key === 'handraise' && newValue === 'start'){
          dispatch(setRaiseHand({raiseHand: true, participantId: participant._id}))
        }
        if(key === 'handraise' && newValue === 'stop'){
          dispatch(setRaiseHand({raiseHand: false, participantId: participant._id}))
        }
        if(key === 'presenting' && newValue === 'start'){
          dispatch(
            showNotification({
              autoHide: true,
              message: `Screen sharing started by ${participant._identity?.user?.name}`,
            })
          );
          dispatch(setPresenter({presenter: true, participantId: participant._id}))
        }
        if(key === 'presenting' && newValue === 'stop'){
          dispatch(setPresenter({presenter: false, participantId: participant._id}))
        }

    })
    //add conference event listener

    conference.addEventListener(SariskaMediaTransport.events.conference.TRACK_REMOVED, (track)=>{
      dispatch(removeRemoteTrack(track));
    })

    conference.addEventListener(SariskaMediaTransport.events.conference.TRACK_ADDED, (track)=>{
      if(track.isLocal()){
        return;
      }
      setTimeout(()=> {
        console.log('TRACK_ADDED', conference?.getRole())
      }, 60000)
      dispatch(addRemoteTrack(track));
    })

    //to show remote participant if you have muted yourseves
    conference.addEventListener(
      SariskaMediaTransport.events.conference.TRACK_MUTE_CHANGED,
      (track) => {
        console.log('TRACK_MUTE_CHANGED', track)
        dispatch(remoteTrackMutedChanged());
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.DOMINANT_SPEAKER_CHANGED,
      (id) => {
        console.log("DOMINANT_SPEAKER_CHANGED", id);
        setDominantSpeakerId(id);
      }
    );

    window.addEventListener("beforeunload", destroy);

    return ()=>{
      destroy();
    }

  },[conference])
  
  useEffect(()=>{
    if(!conference){
      return;
    }
    //if user leaves, destroys all specs
    const userLeft = (id) => {
      if (id === dominantSpeakerId) {
        setDominantSpeakerId(null);
      }
      if(layout.raisedHandParticipantIds[id]){
        dispatch(setRaiseHand({raiseHand: null, participantId: id}))
      }
      dispatch(participantLeft(id));
    };
    conference.addEventListener(
      SariskaMediaTransport.events.conference.USER_LEFT,
      userLeft
    );
    return () => {
      conference.removeEventListener(
        SariskaMediaTransport.events.conference.USER_LEFT,
        userLeft
      );
    };
  },[conference])

  if (!conference || !conference.isJoined()) {
    return <Home />;
  }

  return (
    <Box className={classes.root}>
      <GridLayout dominantSpeakerId={dominantSpeakerId} />
      <ActionButtons dominantSpeakerId={dominantSpeakerId} />
      <SnackbarBox notification={notification} />
    </Box>
  )
}

export default Meeting