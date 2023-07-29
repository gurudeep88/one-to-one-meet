import React from 'react'
import { useSelector } from 'react-redux';
import { useWindowResize } from '../../../hooks/useWindowResize';
import { Box, Grid, makeStyles } from '@material-ui/core';
import VideoBox from '../../shared/VideoBox';

const useStyle = makeStyles(theme => ({
    root: {
        justifyContent: "center",
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
}))

const ParticipantGrid = ({dominantSpeakerId}) => {
    const classes = useStyle();
    const conference = useSelector(state => state.conference);
    const localTracks = useSelector(state => state.localTrack);
    const remoteTracks = useSelector(state => state.remoteTrack);
    const layout = useSelector(state => state.layout);
    const localUser = conference.getLocalUser();

    //all tracks
    const tracks = {...remoteTracks, [localUser.id] : localTracks}

    //all participants
    const participants = [...conference.getParticipantsWithoutHidden(), {_identity: {user: localUser}, _id: localUser.id}];
    // to add desktop track to participants
    participants.filter(participant => layout.presenterParticipantIds?.indexOf(participant._id) >= 0).forEach(p => {
        participants.push({...p, presenter: true});
    })

    let { viewportWidth, viewportHeight } = useWindowResize(participants.length);
    
  return (
    <Box className={classes.root}>
        <Grid container item style={{gap: '20px'}}>
            {
                participants.map((participant, i) => {
                    return (
                        (tracks[participant?._id] || participant?._id)
                        ?
                            <Grid item style={{padding: '10px', background: 'aliceblue'}}>
                                <VideoBox 
                                    tracks = {tracks[participant?._id]} 
                                    height = {'180px'} 
                                    width = {'320px'} 
                                    minWidth = {'320px'} 
                                    minHeight = {'180px'}
                                    participant={participant?._identity?.user}
                                    localUserId={conference?.myUserId()}
                                    isPresenter = {participant?.presenter ? true : false} // for displaying desktop track
                                />
                            </Grid>
                        :
                        null
                    )
                })
            }
        </Grid>
        
    </Box>
  )
}

export default ParticipantGrid