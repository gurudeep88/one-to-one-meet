import React, { useEffect, useRef } from 'react'

const Video = ({track}) => {
    const videoElementRef = useRef();
    console.log('track vie', track)
    useEffect(()=>{
        track.attach(videoElementRef.current);
    },[track])

    if(!track) {return null}

  return (
    <video 
        playsInline='1' 
        autoPlay='1' 
        ref={videoElementRef} 
        style={{left: "-1px",top: "100px",  position: "absolute", width: "calc(60% + 2px)", height: "calc(60% + 2px)", objectFit: 'contain', borderRadius: '8px' }}
    />
  )
}

export default Video