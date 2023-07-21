import React, { useEffect, useRef } from 'react'

const Audio = ({track}) => {
    const audioElementRef = useRef(null);
    console.log('track aud', track)
    useEffect(()=>{
        if(!track || !audioElementRef){
            return;
        }
        track.attach(audioElementRef.current);
        return ()=>{
            track.detach(audioElementRef.current);
        }
    },[track])
  return (
    <audio ref={audioElementRef} playsInline='1' autoPlay='1' />
  )
}

export default Audio