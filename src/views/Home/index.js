import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import SariskaMediaTransport from 'sariska-media-transport/dist/esm/SariskaMediaTransport'
import { setDevices } from '../../store/actions/media';

const Home = () => {
    SariskaMediaTransport.initialize();
    const [localTracks, setLocalTracks] = useState([]);
    const dispatch = useDispatch();

    useEffect(()=>{
        SariskaMediaTransport.mediaDevices.enumerateDevices(allDevices => {
            dispatch(setDevices());
        })
    }[])

    useEffect(()=>{
        const createNewLocalTracks = async() => {
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
        }
        createNewLocalTracks();
    },[])

  return (
    <div>Home</div>
  )
}

export default Home