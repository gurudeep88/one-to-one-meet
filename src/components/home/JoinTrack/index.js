import { Avatar, Box, Button, TextField, makeStyles } from '@material-ui/core'
import React from 'react'
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import VideoBox from '../../shared/VideoBox'
import { color } from '../../../assets/styles/_color';

const JoinTrack = ({
  width, height, minHeight, minWidth, videoTrack, tracks, state, handleChange, handleSubmit
}) => {
const useStyles = makeStyles((theme) => ({
  avatar: {
    zIndex: 1,
    width: '80px',
    height: '80px',
    '& svg': {
      fontSize: '48px'
    }
  },
  videoContainer: {
    width, 
    height, 
    minHeight, 
    minWidth, 
    background: 'lightgray', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    '& .userDetails': {
      display: 'none'
    }
  },
  meetingName: {
    marginBottom: theme.spacing(2)
  },
  actionButton: {
    marginRight: theme.spacing(2),
    minWidth: '140px',
    textTransform: 'initial'
  },
  submitButton: {
    marginTop: theme.spacing(3),
    minWidth: '100%',
    textTransform: 'initial',
    background: color.primaryLight,
    color: 'white',
    '&.MuiButton-root.Mui-disabled': {
      color: 'rgba(0, 0, 0, 0.26)',
      background: '#e2dfdf'
    },
    '&:hover': {
      borderColor: color.primary,
      background: color.white,
      color: color.primary
    }
  }
}))
  const classes = useStyles();
  return (
    <>
     <Box>
            { videoTrack?.isMuted() ? 
          <Box sx={{width, height, minHeight, minWidth, background: 'lightgray', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <Avatar className={classes.avatar}>
                <PersonOutlineIcon />
              </Avatar>
              </Box>
            :
            <Box className={classes.videoContainer}>
              <VideoBox 
                tracks={tracks} 
                height={height} 
                width={width} 
                minHeight={minHeight}
                minWidth={minWidth}
              />
              </Box>
            }
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'column', padding: '25px 0'}}>
          <TextField 
            variant='standard' 
            name='meetingName'
            value={state.meetingName}
            placeholder='Enter Meeting Name' 
            onChange={handleChange} 
            className={classes.meetingName}
          />
          <TextField 
            variant='standard' 
            name='userName'
            value={state.userName}
            placeholder='Enter UserName' 
            onChange={handleChange} 
          />
        </Box>
        <Button onClick={(e)=>handleChange(e, 'audio')} variant='outlined' className={classes.actionButton}>{state.audio}</Button>
        <Button onClick={(e)=>handleChange(e, 'video')} variant='outlined' className={classes.actionButton}>{state.video}</Button>
        <Button 
          onClick={handleSubmit} 
          variant='outlined' 
          className={classes.submitButton}
          disabled={!(state.meetingName && state.userName)}
        >
          Start Conference
        </Button> 
    </>
  )
}

export default JoinTrack