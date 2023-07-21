import { Box } from '@material-ui/core'
import React from 'react'
import Audio from '../Audio';
import Video from '../Video';

const VideoBox = ({conference, participants, tracks}) => {
    console.log('vide box', tracks, conference, participants)
  const audioTrack = tracks[conference.getLocalUser()?.id]?.find(track => track?.isAudioTrack());
  const videoTrack = tracks[conference.getLocalUser()?.id]?.find(track => track?.isVideoTrack());
  return (
    <div>
        <Box>
            <Box>
                <Audio track={audioTrack} />
            </Box>

            <Box>
                <Video track={videoTrack} />
            </Box>
        </Box>
    </div>
  )
}

export default VideoBox