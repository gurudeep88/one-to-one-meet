

import React from 'react';
import { Box, makeStyles, Grid, Typography, Hidden } from '@material-ui/core'
import { useSelector } from "react-redux";
import CloseIcon from '@material-ui/icons/Close';
import VideoBox from "../VideoBox";
import { calculateRowsAndColumns, getLeftTop, isMobileOrTab } from "../../../utils";
import { useWindowResize } from "../../../hooks/useWindowResize";
import { useDocumentSize } from "../../../hooks/useDocumentSize";
import VideoMoreBox from '../VideoMoreBox';
import DrawerBox from '../DrawerBox';
import ParticipantDetails from '../ParticipantDetails';
import { color } from '../../../assets/styles/_color';
import { PARTICIPANTS_VISIBLE_ON_MOBILE } from '../../../constants';

const ParticipantGrid = ({ dominantSpeakerId }) => {
    const [participantState, setParticipantState] = React.useState({
        right: false,
      });
    const layout = useSelector(state => state.layout);
    const useStyles = makeStyles((theme) => ({
        root: {
            justifyContent: "center",
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
        },
        container: {
            position: "relative",
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            [theme.breakpoints.down("md")]: {
                justifyContent: 'center',
                flexDirection: 'row',
            }
        },
        containerItem: {
            position: "relative",
            [theme.breakpoints.down("md")]: {
                display: 'flex', 
                justifyContent: 'center'
            }
        },
        participantHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            "& svg": {
              color: color.white
            }
        },
        title: {
            color: color.white,
            fontWeight: "400",
            marginLeft: "8px",
            fontSize: "28px",
            lineHeight: "1",
            [theme.breakpoints.down("md")]: {
              marginLeft: 0,
              fontSize: '24px'
            }
        }
    }));
    const classes = useStyles();
    const conference = useSelector(state => state.conference);
    const localTracks = useSelector(state => state.localTrack);
    const remoteTracks = useSelector(state => state.remoteTrack);
    const localUser = conference.getLocalUser();

    // all participants 
    const tracks = { ...remoteTracks, [localUser.id]: localTracks };
    // all tracks
    const unorderedParticipants = [...conference.getParticipantsWithoutHidden(), { _identity: { user: localUser }, _id: localUser.id }];
    let participants = [];
    let pinnedParticipantId = layout.pinnedParticipant.participantId;
    unorderedParticipants.filter( p => layout.presenterParticipantIds.indexOf(p._id) >= 0).forEach(p=>{
        unorderedParticipants.push({...p, presenter: true});
        participants.push({...p, presenter: true});
    });
    
    unorderedParticipants.forEach(p=>{
        if(p.presenter === true) return;
        if(p._id === pinnedParticipantId){
            let pinnedParticipant = unorderedParticipants.filter(p => p._id === pinnedParticipantId)[0];
            participants.unshift(pinnedParticipant);    
        }
        if(participants.some(participant=> participant._id === p._id)){
            return;
        }else{
            participants.push({...p});
        }
    });

    let { viewportWidth, viewportHeight } = useWindowResize(participants.length);
    let { documentWidth, documentHeight } = useDocumentSize();
    // const {
    //     rows,
    //     columns,
    //     gridItemWidth,
    //     gridItemHeight,
    //     offset,
    //     lastRowOffset,
    //     lastRowWidth
    // } = calculateRowsAndColumns(participants.length, viewportWidth, viewportHeight); // get grid item dimension
    // now render them as a grid
    
    const participantList = (anchor) => (
        <>
            <Box className={classes.participantHeader}>
            <Typography variant="h6" className={classes.title}>
                Participants
            </Typography>
            <Hidden smUp>
                <CloseIcon onClick={toggleParticipantDrawer(anchor, false)}/>
            </Hidden>
            </Box>
            <ParticipantDetails />
        </>
        );
    const toggleParticipantDrawer = (anchor, open) => (event) => {
        if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }
        setParticipantState({ ...participantState, [anchor]: open });
        };

    const getVideoHeightOfVideoBox = (isHeight)=>{
        if(isMobileOrTab()){
            if( isHeight ) { 
                return participants?.length > 1 ? (viewportHeight * 0.96 / (participants?.length)) :   (viewportHeight * 0.96 / (participants?.length + 1)) 
            }else {
                return viewportWidth / (participants?.length > 1 ? (7/3) : (4/3) )
            }
        }else{
            if(isHeight) {
                return participants?.length > 1 ? (viewportHeight * 0.96 / (participants?.length)) :   (viewportHeight / (participants?.length)) 
            }else{
                return viewportWidth / (participants?.length > 1 ? (7/3) : (5.5 / 3) );
            }
        }
    }

    return (
        <Box className={classes.root}>
            <Grid className={classes.container} style={{ height: isMobileOrTab() ? viewportHeight / 2 : viewportHeight, width: isMobileOrTab() ? '100%' : viewportWidth / 2 }} container item>
                        {participants.map((p, index) => {
                            return (tracks[p?._id] || p?._id) &&
                                <Box className={classes.containerItem} 
                                    style={{height: `${(100 / (participants?.length)) - 2 }%`, width: isMobileOrTab() ?  `${90 / participants?.length}%` : `90%`}}
                                >
                                        <VideoBox key={p?._id}
                                            height={getVideoHeightOfVideoBox(true)}
                                            width={getVideoHeightOfVideoBox(false)}
                                            isBorderSeparator={participants.length > 1}
                                            isFilmstrip={true}
                                            isPresenter={p.presenter ? true : false}
                                            isActiveSpeaker={dominantSpeakerId === p._id}
                                            participantDetails={p?._identity?.user}
                                            participantTracks={tracks[p._id]}
                                            localUserId={conference.myUserId()}
                                        />
                                </Box>
                            }
                        )}
            </Grid>
        <DrawerBox
          open={participantState["right"]}
          onClose={toggleParticipantDrawer("right", false)}
        >
          {participantList("right")}
        </DrawerBox>
        </Box>
    );
}

export default ParticipantGrid;