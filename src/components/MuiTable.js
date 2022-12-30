import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MuiSelect from "./MuiSelect";

const MuiTable = () => {
  const [names, setNames] = useState([]);
  const handleChange = (e) => {
    setNames(e.target.value);
  };

  const tableData = [
    {
      id: 1,
      name: "Collin Pett",
      company: "Tekfly",
      industry: "Electronics",
      status: false,
      "total projects": 62,
      "active projects": 61,
      "total sessions": 9,
      "Video Minutes": 96,
      "audio Minutes": 3,
      "Media Usage": 55,
      "Video Usage": 44,
    },
    {
      id: 2,
      name: "Pren Evamy",
      company: "Livepath",
      industry: "Beauty",
      status: true,
      "total projects": 58,
      "active projects": 10,
      "total sessions": 29,
      "Video Minutes": 57,
      "audio Minutes": 22,
      "Media Usage": 54,
      "Video Usage": 20,
    },
    {
      id: 3,
      name: "Siegfried Golding",
      company: "Youopia",
      industry: "Music",
      status: false,
      "total projects": 1,
      "active projects": 88,
      "total sessions": 47,
      "Video Minutes": 89,
      "audio Minutes": 21,
      "Media Usage": 12,
      "Video Usage": 50,
    },
    {
      id: 4,
      name: "Gawain Markussen",
      company: "Trunyx",
      industry: "Tools",
      status: false,
      "total projects": 15,
      "active projects": 45,
      "total sessions": 38,
      "Video Minutes": 56,
      "audio Minutes": 58,
      "Media Usage": 78,
      "Video Usage": 45,
    },
    {
      id: 5,
      name: "Ernesto Clarridge",
      company: "Mita",
      industry: "Computers",
      status: false,
      "total projects": 90,
      "active projects": 29,
      "total sessions": 14,
      "Video Minutes": 48,
      "audio Minutes": 43,
      "Media Usage": 50,
      "Video Usage": 59,
    },
    {
      id: 6,
      name: "Dore Lyes",
      company: "Skimia",
      industry: "Home",
      status: false,
      "total projects": 87,
      "active projects": 93,
      "total sessions": 46,
      "Video Minutes": 91,
      "audio Minutes": 10,
      "Media Usage": 5,
      "Video Usage": 5,
    },
    {
      id: 7,
      name: "Brigitta Phipps",
      company: "Centizu",
      industry: "Books",
      status: false,
      "total projects": 31,
      "active projects": 16,
      "total sessions": 40,
      "Video Minutes": 66,
      "audio Minutes": 58,
      "Media Usage": 73,
      "Video Usage": 38,
    },
    {
      id: 8,
      name: "Vidovik Kerbey",
      company: "Jabberbean",
      industry: "Clothing",
      status: true,
      "total projects": 20,
      "active projects": 55,
      "total sessions": 30,
      "Video Minutes": 91,
      "audio Minutes": 13,
      "Media Usage": 30,
      "Video Usage": 51,
    },
    {
      id: 9,
      name: "Clerc Pearsey",
      company: "Flashdog",
      industry: "Automotive",
      status: true,
      "total projects": 95,
      "active projects": 49,
      "total sessions": 71,
      "Video Minutes": 56,
      "audio Minutes": 47,
      "Media Usage": 67,
      "Video Usage": 48,
    },
    {
      id: 10,
      name: "Agnesse Gittis",
      company: "Photospace",
      industry: "Movies",
      status: true,
      "total projects": 30,
      "active projects": 11,
      "total sessions": 59,
      "Video Minutes": 41,
      "audio Minutes": 25,
      "Media Usage": 10,
      "Video Usage": 57,
    },
  ];
  const headers = [
    "Company",
    "Industry",
    "Status",
    "Total Projects",
    "Active Projets",
    "Total Sessions",
    "Video Minutes",
    "Audio Minutes",
    "Media Usage",
    "Video Usage",
  ];
  const [data, setData] = useState(tableData);
  const helper = (names) => {
    if (names.length === 0) {
      setData(tableData);
      return;
    }
    const filteredData = [];
    names.forEach((nameToFilter) => {
      const result = tableData.filter((temp) => {
        return temp.name === nameToFilter;
      });
      filteredData.push(...result);
    });

    //console.log(filteredData);
    setData(filteredData);
  };
  useEffect(() => {
    console.log(names);
    //setData(filteredData);
    helper(names);
  }, [names]);
  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <colgroup>
          {[...Array(11)].map((item, index) => {
            index <= 3 ? (
              <col style={{ width: "10%" }} />
            ) : (
              <col style={{ width: "5%" }} />
            );
          })}
        </colgroup>
        <TableHead sx={{ fontWeight: "bold" }}>
          <TableRow>
            <TableCell align="center">
              Name <KeyboardArrowDownIcon />{" "}
              <MuiSelect names={names} handleChange={handleChange} />
            </TableCell>
            {headers.map((item) => (
              <TableCell align="center">{item}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow>
              <TableCell align="center">{row.name}</TableCell>
              <TableCell align="center">{row.company}</TableCell>
              <TableCell align="center">{row.industry}</TableCell>
              <TableCell align="center">
                {row.status ? "Active" : "Inactive"}
              </TableCell>
              <TableCell align="center">{row["total projects"]}</TableCell>
              <TableCell align="center">{row["active projects"]}</TableCell>
              <TableCell align="center">{row["total sessions"]}</TableCell>
              <TableCell align="center">{row["Video Minutes"]}</TableCell>
              <TableCell align="center">{row["audio Minutes"]}</TableCell>
              <TableCell align="center">{row["Media Usage"]}</TableCell>
              <TableCell align="center">{row["Video Usage"]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MuiTable;
