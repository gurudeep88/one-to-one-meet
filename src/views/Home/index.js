import React, { useEffect, useState } from 'react'
import SariskaMediaTransport from 'sariska-media-transport/dist/esm/SariskaMediaTransport';
import Lobby from '../../components/home/Lobby';

const Home = () => {
  const [localTracks, setLocalTracks] = useState([]);
  SariskaMediaTransport.initialize();
  SariskaMediaTransport.setLogLevel(SariskaMediaTransport.logLevels.ERROR);
  const iAmRecorder = window.location.hash.indexOf("iAmRecorder") >= 0;

  useEffect(()=>{
    console.log('sfugn')
    SariskaMediaTransport.mediaDevices.enumerateDevices((allDevices)=>{
      console.log('alldevices', allDevices);
    })
  },[])

  useEffect(()=>{
    console.log('sugn')
    if(iAmRecorder){
      setLocalTracks([]);
      return;
    }
    const createNewLocalTracks = async()=>{
      console.log('ntrdfg')
      const tracks = [];
      try {
        const [audioTrack] = await SariskaMediaTransport.createLocalTracks({devices: ["audio"], resolution: 720});
        console.log('audioTrack', audioTrack)
        tracks.push(audioTrack);
      } catch (error) {
        console.log('failed to fetch audio device', error);
      }

      try {
        const [videoTrack] = await SariskaMediaTransport.createLocalTracks({devices: ["video"], resolution: 720});
        console.log('videoTrack', videoTrack)
        tracks.push(videoTrack);
      } catch (error) {
        console.log('failed to fetch video device', error)
      }
      setLocalTracks(tracks);
    }
    createNewLocalTracks();
  },[])
console.log('localTracks', localTracks)
  return (
    <div>
      <Lobby tracks = {localTracks} />
    </div>
  )
}

export default Home