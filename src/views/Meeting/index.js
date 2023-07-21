import React, { useEffect, useState } from 'react'
import SariskaMediaTransport from 'sariska-media-transport/dist/esm/SariskaMediaTransport';
import SpeakerLayout from '../../components/meeting/SpeakerLayout';

const Meeting = ({localTracks, connection, conference}) => {
  let trackState = {};
  const destroy = async() => {
    console.log('destroy')
    if(conference?.isJoined()){
      await conference?.leave();
    }
    for(const track of localTracks){
      await track.dispose();
    }
    await connection.disconnect();
  }
  useEffect(()=>{
    if(!conference) return;

    conference.addEventListener(SariskaMediaTransport.events.conference.TRACK_ADDED, (track) => {
      if(track.isLocal()) return;
      let participantId = track.getParticipantId();
      if(!trackState[participantId]){
        trackState[participantId] = [];
      }
      trackState[participantId].push(track);
    });

    conference.addEventListener(SariskaMediaTransport.events.conference.TRACK_REMOVED, (track)=>{
      let participantId = track.getParticipantId();
      if(participantId){
        trackState[participantId] = trackState[participantId].filter(item => item.getId() !== track.getId())
      }
      if(trackState[participantId]?.length === 0){
        delete trackState[participantId]
      }
    });

    // return () => {
    //   destroy();
    // };
  },[conference]);

  useEffect(() => {
    if (!conference) {
      return;
    }
    const userLeft = (id) => {
      console.log('user left', id)
      delete trackState[id]
    };
    conference.addEventListener(
      SariskaMediaTransport.events.conference.USER_LEFT,
      userLeft
    );
    return () => {
      conference.removeEventListener(
        SariskaMediaTransport.events.conference.USER_LEFT,
        userLeft
      );
    };
  }, [conference]);
console.log('new track', trackState, conference, localTracks)
  return (
    <div>
      <SpeakerLayout 
        remoteTracks = {trackState}
        localTracks={localTracks}
        conference={conference}
      />
    </div>
  )
}

export default Meeting