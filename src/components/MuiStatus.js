import { Box, TextField, MenuItem } from "@mui/material";

import React from "react";

const MuiStatus = ({ value, handleChange }) => {
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
        <MenuItem value="Active">Active</MenuItem>
        <MenuItem value="Inactive">Inactive</MenuItem>
      </TextField>
    </Box>
  );
};

export default MuiStatus;
