import { Box, TextField, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";

import React from "react";

const MuiSelect = ({ value, handleChange, arr, property }) => {
  //console.log(arr);

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
        {/* <MenuItem value="Dore Lyes">Dore Lyes</MenuItem>
        <MenuItem value="Clerc Pearsey">Clerc Pearsey</MenuItem>
        <MenuItem value="Pren Evamy">Pren Evamy</MenuItem> */}
        {arr.map((each) => (
          <MenuItem key={each.id} value={each[property]}>
            {each[property]}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default MuiSelect;
