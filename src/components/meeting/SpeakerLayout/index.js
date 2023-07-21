import React from 'react'
import VideoBox from '../VideoBox';

const SpeakerLayout = ({remoteTracks, localTracks, conference}) => {
    const constraints = {
        "colibriClass": "ReceiverVideoConstraints",
        "defaultConstraints": { "maxHeight":  180, "maxFrameRate": 15 }
    }
    conference?.setReceiverConstraints(constraints);
    const localUser = conference.getLocalUser();
    const tracks = {...remoteTracks, [localUser.id]: localTracks };
    const participants = [
        ...conference.getParticipantsWithoutHidden(), 
        {_identity: {user: localUser}, _id: localUser.id}
    ];
    console.log('first participants', participants, localUser, tracks)
  return (
    <div>
        <VideoBox 
            conference={conference}
            participants={participants}
            tracks={tracks}
        />
    </div>
  )
}

export default SpeakerLayout