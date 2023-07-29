import React from 'react'
import { useSelector } from 'react-redux'
import ParticipantGrid from '../ParticipantGrid';

const GridLayout = ({dominantSpeakerId}) => {
    const conference = useSelector(state => state.conference);
    const constraints = {
        "colibriClass": "ReceiverVideoConstraints",
        "defaultConstraints": { 
            "maxHeight":  180, 
            "maxFrameRate": 15 
        }
    };
    conference.setReceiverConstraints(constraints);
  return (
    <ParticipantGrid dominantSpeakerId={dominantSpeakerId} />
  )
}

export default GridLayout