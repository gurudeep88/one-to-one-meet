import { Box, TextField, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";

import React from "react";

const MuiCompany = ({ value, handleChange }) => {
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
    <Box width="150px">
      <TextField
        label="Search"
        select
        value={value}
        fullWidth
        onChange={handleChange}
        SelectProps={{
          multiple: true,
        }}
      >
        <MenuItem value="Livepath">Livepath</MenuItem>
        <MenuItem value="Sariska">Sariska</MenuItem>
        <MenuItem value="Tekfly">Tekfly</MenuItem>
      </TextField>
    </Box>
  );
};

export default MuiCompany;
