import './App.css';
import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {Checkbox,Box} from '@mui/material';
import { useState } from 'react';

import Button from '@mui/material/Button';
import DialogComponent from './DialogComponent';


function App() {

  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };


  const [dialogOpen, setDialogOpen] = useState(false)



  const handleDialogClose = () => {
    setDialogOpen(false);
    window.location.reload()
  };
  const [selectedArray, setSelectedArray] = useState([])
  return (
    <div className="App">
    <Box sx={{display: "flex", justifyContent: "flex-end"}}>
     {
      selectedArray.length > 0 && <Button variant="contained" className='btn' onClick={() => setDialogOpen(true)}>Edit</Button>
     } 
    </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead className='head'>
            <TableRow>
              <TableCell className='box'></TableCell>
              <TableCell className='box'>Ticket Number</TableCell>
              <TableCell className='box'>Classification</TableCell>
              <TableCell className='box'>Priority</TableCell>
              <TableCell className='box'>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell className='box'><Checkbox {...label} onChange={(e) => {
                if(selectedArray.length === 0){
                  setSelectedArray(["1"])
                }else{
                  setSelectedArray([])
                }
              }} /></TableCell>
              <TableCell className='box'>#123</TableCell>
              <TableCell className='box'>Content</TableCell>
              <TableCell className='box'><span className="small">High</span></TableCell>
              <TableCell className='box'>
              Open
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='box'><Checkbox {...label} /></TableCell>
              <TableCell className='box'>#133</TableCell>
              <TableCell className='box'>Content</TableCell>
              <TableCell className='box'><span className="small">High</span></TableCell>
              <TableCell className='box'>
              Open
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      {
        console.log({dialogOpen})
      }
      <DialogComponent handleClose={handleDialogClose} dialogOpen={dialogOpen} />
    </div>
  );
}

export default App;
