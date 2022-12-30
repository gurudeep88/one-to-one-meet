import {Box, TextField, MenuItem} from '@mui/material'
import { useState, useEffect } from 'react'

import React from 'react'

const MuiSelect = ({names, handleChange}) => {
    //const [names, setName] = useState([]);
    
    // const handleChange = (e) => {
    //     //console.log(names);
    //     setName(e.target.value);
    //     console.log(names);
    // }
    // useEffect(() => {
    //     setName(names);
    // },[names])
  return (
    <Box width='250px'>
        <TextField
            label='Search'
            select
            value={names}
            fullWidth
            onChange = {handleChange}
            SelectProps={{
                multiple : true,
            }}
        >
            <MenuItem value="Dore Lyes">Dore Lyes</MenuItem>
            <MenuItem value="Clerc Pearsey">Clerc Pearsey</MenuItem>
            <MenuItem value="Pren Evamy">Pren Evamy</MenuItem>
        </TextField>
    </Box>
  )
}

export default MuiSelect