import { Box, makeStyles } from '@material-ui/core';
import { Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import PanToolIcon from "@material-ui/icons/PanTool";
import CallEndIcon from "@material-ui/icons/CallEnd";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import { addLocalTrack, localTrackMutedChanged, removeLocalTrack } from '../../../store/actions/track';
import { color } from '../../../assets/styles/_color';
import classNames from 'classnames';
import { clearAllReducers } from '../../../store/actions/conference';
import { refreshPage } from '../../../utils';
import SariskaMediaTransport from 'sariska-media-transport/dist/esm/SariskaMediaTransport';
import { showNotification } from '../../../store/actions/notification';
import { setPresenter } from '../../../store/actions/layout';

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
        <Tooltip title="Leave Call">
          <CallEndIcon onClick={leaveConference} className={classes.end} />
        </Tooltip>
      </Box>
    </Box>
  )
}

export default ActionButtons