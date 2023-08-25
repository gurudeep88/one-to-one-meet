import { Box, makeStyles } from '@material-ui/core';
import { Tooltip } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import PanToolIcon from "@material-ui/icons/PanTool";
import CallEndIcon from "@material-ui/icons/CallEnd";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import AlbumIcon from "@material-ui/icons/Album";
import { addLocalTrack, localTrackMutedChanged, removeLocalTrack } from '../../../store/actions/track';
import { color } from '../../../assets/styles/_color';
import classNames from 'classnames';
import { clearAllReducers } from '../../../store/actions/conference';
import { refreshPage } from '../../../utils';
import SariskaMediaTransport from 'sariska-media-transport/dist/esm/SariskaMediaTransport';
import { showNotification } from '../../../store/actions/notification';
import { setPresenter } from '../../../store/actions/layout';
import { authorizeDropbox } from '../../../utils/dropbox-apis';
import { RECORDING_ERROR_CONSTANTS, s3 } from '../../../constants';

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
    border: `1px solid ${color.white}`,
    borderRadius: '50%',
    padding: theme.spacing(1),
    cursor: 'pointer',
    fontSize: '24px'
  },
  active: {
    opacity: "0.8",
    cursor: "pointer",
    color: color.red,
  },
  end: {
    background: `${color.red} !important`,
    borderColor: `${color.red} !important`,
    padding: "2px 12px !important",
    textAlign: "center",
    borderRadius: "30px !important",
    width: "42px",
    fontSize: "36px",
    marginRight: 0,
    "&:hover": {
      opacity: "0.8",
      background: `${color.red} !important`,
      cursor: "pointer",
      color: `${color.white} !important`,
    },
    [theme.breakpoints.down("sm")]: {
      padding: "8px !important",
      width: "40px",
      fontSize: "24px",
    },
  },
}))

const ActionButtons = ({dominantSpeakerId}) => {
  const classes = useStyles();
  const [raiseHand, setRaiseHand] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const conference = useSelector((state) => state.conference);
  const localTracks = useSelector((state) => state.localTrack);
  const audioTrack = localTracks.find(track => track?.isAudioTrack());
  const videoTrack = localTracks.find(track => track?.isVideoTrack());
  const recordingSession = useRef();
  const [features, setFeatures] = useState({});
  let recordingPlatform = 's3';

  const dispatch = useDispatch();

  const muteAudio = async () => {
    await audioTrack?.mute();
    dispatch(localTrackMutedChanged());
  };

  const unmuteAudio = async () => {
    await audioTrack?.unmute();
    dispatch(localTrackMutedChanged());
  };

  const muteVideo = async () => {
    await videoTrack?.mute();
    dispatch(localTrackMutedChanged());
  };

  const unmuteVideo = async () => {
    await videoTrack?.unmute();
    dispatch(localTrackMutedChanged());
  };

  const startRaiseHand = () => {
    conference.setLocalParticipantProperty("handraise", "start");
    setRaiseHand(true);
  }

  const stopRaiseHand = () => {
    conference.setLocalParticipantProperty("handraise", "stop");
    setRaiseHand(false);
  }

  const shareScreen = async() => {
    let desktopTrack;
    try {
      //create a new track of videoType = 'desktop'
      const tracks = await SariskaMediaTransport.createLocalTracks({devices: ["desktop"], resolution: 720});
      //filter the track and assign to varible
      desktopTrack = tracks?.find(track => track?.videoType === 'desktop');
    }catch(error){
      dispatch(showNotification({
        message: "Oops, Something wrong with screen sharing permissions. Try reload",
        severity: 'warning',
        autoHide: true
      }))
      console.log('error in starting screen share');
      return;
    }
    //add the local desktop track to conference
    await conference.addTrack(desktopTrack);
    desktopTrack.addEventListener(SariskaMediaTransport.events.track.LOCAL_TRACK_STOPPED, async()=>{
       stopPresenting();
    })
    //set setLocalParticipantProperty to the participant in conference
    conference.setLocalParticipantProperty("presenting", "start");
    //add track to redux state
    dispatch(addLocalTrack(desktopTrack));
    // make participant presenter redux state as true
    dispatch(setPresenter({participantId: conference.myUserId(), presenter: true}));
    setPresenting(true);
  }

  const stopPresenting = async() => {
    //get the desktop track
    const desktopTrack = localTracks.find(track => track?.videoType === 'desktop');
    //remove local desktop track from conference
    await conference.removeTrack(desktopTrack);
    // make local participant presenter redux state as false
    dispatch(setPresenter({participantId: conference.myUserId(), presenter: false}));
    //remove local track from redux state
    dispatch(removeLocalTrack(desktopTrack));
    //remove setLocalParticipantProperty to the participant in conference
    conference.setLocalParticipantProperty("presenting", "stop");
    setPresenting(false);
  }

  const startRecording = async() => {
    if(features.recording){
      return;
    }
    if(conference.getRole() === 'none'){
      return dispatch(
        showNotification({
          severity: 'info',
          autoHide: true,
          message: 'You are not moderator!!'
        })
      )
    }
    // const response = await authorizeDropbox();
    // if(!response?.token){
    //   return dispatch(
    //     showNotification({
    //       severity: "error",
    //       message: "Recording failed no dropbox token",
    //     })
    //   );
    // }

    // let dropBox = {
    //   file_recording_metadata: {
    //     upload_credentials: {
    //       service_name: "dropbox",
    //       token: response.token,
    //       app_key: process.env.DROPBOX_API_KEY,
    //       r_token: response.rToken
    //     }
    //   }
    // }

    const appData = s3;

    dispatch(
      showNotification({
        severity: "info",
        message: "Starting Recording",
        autoHide: false,
      })
    );
    const session = await conference.startRecording({
      mode: SariskaMediaTransport.constants.recording.mode.FILE,
      appData: JSON.stringify(s3)
    })
    console.log('first session', session);
    recordingSession.current = session;
  }

  const stopRecording = async() => {
    if(!features.recording){
      return;
    }
    if (conference?.getRole() === "none") {
      return dispatch(
        showNotification({
          severity: "info",
          autoHide: true,
          message: "You are not moderator!!",
        })
      );
    }
    await conference.stopRecording(localStorage.getItem('recording_session_id'))
  }

  const setFeatureType = (feature) => {
    features[feature.key] = feature.value;
    setFeatures({...features});
  }

  useEffect(()=>{
    conference.getParticipantsWithoutHidden().forEach(item => {
      if(item._properties?.recording){
        setFeatureType({key: 'recording', value: true})
      }
    })
    conference.addEventListener(
      SariskaMediaTransport.events.conference.RECORDER_STATE_CHANGED, (data)=>{
        if(data._status === 'on' && data._mode ==='file'){
          conference.setLocalParticipantProperty("recording", true);
          dispatch(
            showNotification({ autoHide: true, message: "Recording started", severity: 'info' })
          );
          setFeatureType({key: "recording", value: true})
          localStorage.setItem("recording_session_id", data?._sessionID)
        }
        if (data._status === "off" && data._mode === "file") {
          conference.removeLocalParticipantProperty("recording");
          dispatch(
            showNotification({ autoHide: true, message: "Recording stopped" })
          );
          setFeatureType({ key: "recording", value: false });
        }
        if(data._mode === 'file' && data._error){
          conference.removeLocalParticipantProperty('recording');
          dispatch(
            showNotification({
              autoHide: true,
              message: RECORDING_ERROR_CONSTANTS[data._error],
            })
          );
          setFeatureType({key: 'recording', value: false})
        }
      }
    )
  },[])

  const leaveConference = async() => {
    dispatch(clearAllReducers());
      refreshPage();
  }

  return (
    <Box sx={{mt: 4, color: color.white}}>
      <Box>
      <Tooltip
          title={
            audioTrack
              ? audioTrack?.isMuted()
                ? "Unmute Audio"
                : "Mute Audio"
              : "Check the mic or Speaker"
          }
        >
          {audioTrack ? (
            audioTrack?.isMuted() ? (
              <MicOffIcon onClick={unmuteAudio} className={classNames(classes.icon, classes.active)} />
            ) : (
              <MicIcon onClick={muteAudio} className={classes.icon} />
            )
          ) : (
            <MicIcon onClick={muteAudio} style={{ cursor: "unset" }} className={classes.icon}/>
          )}
        </Tooltip>
        <Tooltip
          title={videoTrack?.isMuted() ? "Unmute Video" : "Mute Video"}
        >
          {videoTrack?.isMuted() ? (
            <VideocamOffIcon onClick={unmuteVideo} className={classNames(classes.icon, classes.active)}/>
          ) : (
            <VideocamIcon onClick={muteVideo} className={classes.icon}/>
          )}
        </Tooltip>
        <Tooltip title = {raiseHand ? "Hand Down" : "Raise Hand"}>
            {
              raiseHand ?
                <PanToolIcon
                  onClick={stopRaiseHand}
                  className={classNames(classes.active, classes.icon)}
                  style={{fontSize: '18px', padding: '11px'}}
                />
              :
                <PanToolIcon
                  onClick={startRaiseHand}
                  className={classNames(classes.icon)}
                  style={{fontSize: '18px', padding: '11px'}}
                />
            }
        </Tooltip>
        <Tooltip title = {presenting ? "Stop Presenting" : "Share Screen"}>
            {
              presenting ?
                <StopScreenShareIcon
                  onClick={stopPresenting}
                  className={classNames(classes.active, classes.icon)}
                  style={{fontSize: '18px', padding: '11px'}}
                />
              :
                <ScreenShareIcon
                  onClick={shareScreen}
                  className={classNames(classes.icon)}
                  style={{fontSize: '18px', padding: '11px'}}
                />
            }
        </Tooltip>
        <Tooltip title = {features.recording ? "Stop Recording" : "Start Recording"}>
            {
              features.recording ?
                <AlbumIcon
                  onClick={stopRecording}
                  className={classNames(classes.active, classes.icon)}
                  style={{fontSize: '18px', padding: '11px'}}
                />
              :
                <AlbumIcon
                  onClick={startRecording}
                  className={classNames(classes.icon)}
                  style={{fontSize: '18px', padding: '11px'}}
                />
            }
        </Tooltip>
        <Tooltip title="Leave Call">
          <CallEndIcon onClick={leaveConference} className={classes.end} />
        </Tooltip>
      </Box>
    </Box>
  )
}

export default ActionButtons