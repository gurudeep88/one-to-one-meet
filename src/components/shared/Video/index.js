import React, { useEffect, useRef } from 'react'

const Video = (props) => {
    const {track, height, width, minHeight, minWidth} = props;
    const ref = useRef(null);
    useEffect(()=>{
        track?.attach(ref.current)
    },[track])

    if(!track){
        return null;
    }
    
  return (
    <video
        ref={ref}
        playsInline="1"
        autoPlay="1"
        style={{width, height, transform: 'scaleX(-1)', minWidth, minHeight}}
    />
  )
}

export default Video