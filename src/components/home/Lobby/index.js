import React, { useState } from 'react'
import { getToken } from '../../../utils';
import SariskaMediaTransport from 'sariska-media-transport/dist/esm/SariskaMediaTransport';
import { Button } from '@material-ui/core';
import Meeting from '../../../views/Meeting';

const Lobby = ({tracks}) => {
    console.log('tracksa ', tracks)
    const [conference, setConference] = useState(null);
    const [connection, setConnection] = useState(null);

    const handleSubmit = async() => {
        const token = await getToken();
        const connection = new SariskaMediaTransport.JitsiConnection(
            token,
            "newmeet"
        );
        connection.addEventListener(SariskaMediaTransport.events.connection.CONNECTION_ESTABLISHED, () => {
          console.log('connection est')
            setConnection(connection);
            createConference(connection);
        });
        connection.addEventListener(SariskaMediaTransport.events.connection.CONNECTION_FAILED, async(error) => {
            if(error === SariskaMediaTransport.errors.connection.PASSWORD_REQUIRED){
                const token = await getToken();
                connection.setToken(token);
            }
            if (
                error ===
                SariskaMediaTransport.errors.connection.CONNECTION_DROPPED_ERROR
              ) {
                console.log("connection lost");
              }
        });
        connection.addEventListener(
            SariskaMediaTransport.events.connection.CONNECTION_DISCONNECTED,
            (error) => {
              console.log("connection disconnect!!!", error);
            }
        );
        connection.connect();
    }

    const createConference = async(connection) => {
        const conference = await connection.initJitsiConference();
        tracks.forEach(async track => await conference.addTrack(track));

        conference.addEventListener(SariskaMediaTransport.events.conference.CONFERENCE_JOINED, ()=>{
            setConference(conference);
            console.log('conference joined', conference);
        });
        conference.addEventListener(
            SariskaMediaTransport.events.conference.CONFERENCE_ERROR,
            () => {
              console.log('CONFERENCE_ERROR');
            }
        );
        conference.addEventListener(
            SariskaMediaTransport.events.conference.USER_JOINED,
            (id) => {
              console.log('USER_JOINED', id)
            }
        );
        conference.join();
    }
  return (
    <div>
        <Button onClick={handleSubmit}>Start Conference</Button>
        {conference ? <Meeting 
            localTracks={tracks} 
            connection={connection}
            conference = {conference}
        /> : null}
    </div>
  )
}

export default Lobby