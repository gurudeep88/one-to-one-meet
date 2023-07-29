import React from 'react'
import Video from '../Video'
import { useSelector } from 'react-redux';
import { Avatar, Box, Typography, makeStyles } from '@material-ui/core';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import classNames from 'classnames';
import { color } from '../../../assets/styles/_color';
import { PanTool } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
  avatar: {
    zIndex: 1,
    width: '80px',
    height: '80px',
    '& svg': {
      fontSize: '48px'
    }
  },
  pan: {
    color: color.primaryLight,
    position: 'absolute',
    marginTop: '-182px',
  },
  textBox: {
    color: color.white,
    position: 'absolute',
    marginTop: '-27px',
    marginLeft: '4px'
  }
}))

const VideoBox = ({tracks, height, width, minWidth, minHeight, localUserId, participant, isPresenter}) => {
  const classes = useStyles();
  //adds video or desktop track
  let videoTrack = isPresenter ?
     tracks?.find(track => track?.getVideoType() === 'desktop')
     : tracks?.find(track => track?.getType() === 'video');
  //for the remote participant to show the action of local participants on his side
  const {raisedHandParticipantIds} = useSelector(state => state.layout);
  const layout = useSelector(state => state.layout);
  
  return (
    <div style={{background: isPresenter && '#42424a'}}>
      {
        videoTrack?.isMuted() ? //to show video muted on remote side.
        <Box sx={{width, height, minHeight, minWidth, background: 'lightgray', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Avatar className={classes.avatar}>
            <PersonOutlineIcon />
          </Avatar>
        </Box>
        :
        <Video 
            width={width}
            height={height}
            track={videoTrack}
            minHeight={minHeight}
            minWidth={minWidth}
            isPresenter={isPresenter}
        />
      }
      <Box>
        {
          raisedHandParticipantIds[participant?.id] ?
          <Typography className={classes.pan}>
              <PanTool />
          </Typography>
          :
          null
        }
      </Box>
      <Typography className={classNames(classes.textBox, {userDetails: true})} >
        {
        localUserId === participant?.id 
        ? "You"
        : participant?.name
        }
      </Typography>
    </div>
  )
}

export default VideoBox