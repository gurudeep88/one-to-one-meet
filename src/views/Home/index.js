import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import SariskaMediaTransport from 'sariska-media-transport/dist/esm/SariskaMediaTransport'
import { setDevices } from '../../store/actions/media';
import { addLocalTrack } from '../../store/actions/track';
import LobbyRoom from '../../components/home/LobbyRoom';
import { Box, Button } from '@material-ui/core';

const Home = () => {
    const localTracksRedux = useSelector(state => state.localTrack);
    const [localTracks, setLocalTracks] = useState([]);
    const resolution = useSelector(state => state.media?.resolution);
    const dispatch = useDispatch();

    SariskaMediaTransport.initialize();

    useEffect(()=>{
        SariskaMediaTransport.mediaDevices.enumerateDevices(allDevices => {
            dispatch(setDevices());
        })
        setLocalTracks([]);
    }, [])

    const createNewLocalTracks = async() => {
        if (localTracksRedux.length > 0)  {
            return;
        }
        let tracks = [];
        try {
            const [audioTrack] = await SariskaMediaTransport.createLocalTracks({devices: ["audio"], resolution});
            tracks.push(audioTrack);
        } catch (error) {
            console.log('error in fetching local audio track', error);
        }

        try {
            const [videoTrack] = await SariskaMediaTransport.createLocalTracks({devices: ["video"], resolution});
            tracks.push(videoTrack);
        } catch (error) {
            console.log('error in fetching video track', error);
        }
        setLocalTracks(tracks);
        tracks.forEach(track => dispatch(addLocalTrack(track)));
    }


console.log('tracks ', localTracks)
  return (
    <div style={{minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Box sx={{textAlign: 'center'}}>
            {
                !localTracks?.length ?  
                <Button variant='outlined' onClick={createNewLocalTracks}>Create Local Tracks</Button>
                : <LobbyRoom tracks={localTracks} />
            }
        </Box>
    </div>
  )
}

export default Home