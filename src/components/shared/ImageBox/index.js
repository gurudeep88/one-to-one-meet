import {
  Avatar,
  Box,
  makeStyles
} from "@material-ui/core";
import React from "react";
import { color } from "../../../assets/styles/_color";
import classnames from "classnames";
import { isMobileOrTab } from "../../../utils";
import { useWindowResize } from "../../../hooks/useWindowResize";
import { useSelector } from "react-redux";

const ImageBox = ({
  numParticipants = 3
}) => {
    
  const conference = useSelector(state => state.conference);
  const localUser = conference.getLocalUser();
  const participants = [...conference.getParticipantsWithoutHidden(), { _identity: { user: localUser }, _id: localUser.id }];

  let { viewportWidth, viewportHeight } = useWindowResize(participants?.length);
  
  const useStyles = makeStyles((theme) => ({
    root: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "8px",
      background: color.secondary,
      display: "flex",
      flexDirection: "column",
      transform: "translateZ(0)",
      "& .largeVideo": {
        height: theme.spacing(20),
        width: theme.spacing(20),
        fontSize: "40pt",
      },
      [theme.breakpoints.down("sm")]: {
          background: numParticipants>1 ? color.secondary : "transparent",
      },
    },
    audioBox: {
      background: numParticipants>1 ? color.secondary : "transparent",
      position: "absolute",
      top: 0,
      zIndex: 1,
      display: "flex",
      justifyContent: "flex-end",
      padding: theme.spacing(1),
      color: color.white,
      "& svg": {
        background: color.secondary,
        borderRadius: "50%",
        padding: "5px",
        [theme.breakpoints.down("sm")]: {
          background: numParticipants>1 ? color.secondary : "transparent",
        },
      },
      [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(0.25, 1, 1, 0.25),
      },
    },
    controls: {
      cursor: "pointer",
      color: "white",
      height: "20px",
      width: "20px",
      position: "absolute",
      margin: "auto",
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      padding: "8px",
    },
    videoBorder: {
      boxSizing: "border-box",
      border: `3px solid ${color.primaryLight}`,
      borderRadius: "8px",
      position: "absolute",
      width: "100%",
      height: "100%",
      zIndex: "999",
    },
    textBox: {
      bottom: 0,
      display: "flex",
      justifyContent: "flex-start",
      padding: theme.spacing(1),
      color: color.white,
      background: "transparent",
      position: "absolute",
      "& p": {
        padding: "2px 4px",
      },
    },
    avatarBox: {
      height: "100%",
      width: "100%",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexGrow: 1,
    },
    avatar: {
      borderRadius: "50%",
      position: "absolute",
      transition: "box-shadow 0.3s ease",
      height: numParticipants === 1 ? theme.spacing(20) : theme.spacing(10),
      width: numParticipants === 1 ? theme.spacing(20) :theme.spacing(10),
      fontSize: numParticipants ===1 && '40pt'
    },
    rightControls: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      padding: theme.spacing(1),
      right: 0,
      zIndex: "9999",
    },
    handRaise: {
      marginLeft: "8px",
      color: color.primary,
      lineHeight: "0!important",
    },
    disable: {
      background: color.red,
      borderColor: `${color.red} !important`,
      "&:hover": {
        opacity: "0.8",
        background: `${color.red} !important`,
      },
    },
    subtitle: {
      position: "absolute",
      bottom: 0,
    },
    videoWrapper: {
      position: "absolute",
      right: 0,
      left: 0,
      top: 0,
      bottom: 0,
      margin: "auto",
    },
  }));

  const classes = useStyles();

  const audioIndicatorActiveClasses = classnames(classes.avatar);

  const avatarActiveClasses = classnames(classes.avatarBox);

  const getVideoHeightOfVideoBox = (isHeight)=>{
    if(isMobileOrTab()){
        if( isHeight ) { 
            return viewportHeight * 0.96 / 2; 
        }else {
            return viewportWidth * 3 / 4;
        }
    }else{
        if(isHeight) {
            return viewportHeight;
        }else{
            return participants?.length >1 ? viewportWidth / (7/3)  : viewportWidth * 3 / 5.5;
        }
    }
}

  return (
    <Box
      style={{ width: getVideoHeightOfVideoBox(false), height: getVideoHeightOfVideoBox(true), margin: 'auto' }}
      className={classes.root}
    >
        <Box className={avatarActiveClasses}>
          <Avatar
            src={null}
            className={audioIndicatorActiveClasses}
          >
            {'G'}
          </Avatar>
        </Box>
      
    </Box>
  );
};

export default ImageBox;
