import "./App.css";
import React, { useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Checkbox,
  Box,
  Modal,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";

import Button from "@mui/material/Button";
import DialogComponent from "./DialogComponent";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "none",
  borderRadius: "10px",
  boxShadow: 24,
  p: 2,
};

const ZOHO = window.ZOHO;

function App() {
  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  const [zohoInitialized, setZohoInitialized] = useState();
  const [loading, setLoading] = useState(true);
  const [entityId, setEntityId] = useState();

  const [toggle, setToggle] = useState(false);

  const [selectedArray, setSelectedArray] = useState([]);
  const [ticketList, setTicketList] = useState([]);

  useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", async function (data) {
      setLoading(true);
      // console.log(data);
      setEntityId(data?.EntityId);
      let func_name = "Zoho_desk_ticket_handle_from_milestones";
      let req_data = {
        get_tickets: true,
        milestone_id: data?.EntityId,
      };
      await ZOHO.CRM.FUNCTIONS.execute(func_name, req_data).then(
        async function (result) {
          // console.log(result);
          let resp = JSON.parse(result?.details?.output);
          setTicketList(resp?.list || []);
          setLoading(false);
        }
      );
    });

    ZOHO.embeddedApp.init().then(() => {
      setZohoInitialized(true);
    });
  }, []);

  useEffect(() => {
    const fetchUpdateData = async () => {
      setLoading(true);
      // console.log(data);
      let func_name = "Zoho_desk_ticket_handle_from_milestones";
      let req_data = {
        get_tickets: true,
        milestone_id: entityId,
      };
      await ZOHO.CRM.FUNCTIONS.execute(func_name, req_data).then(
        async function (result) {
          // console.log(result);
          let resp = JSON.parse(result?.details?.output);
          setTicketList(resp?.list || []);
          setLoading(false);
        }
      );
    };

    fetchUpdateData();
  }, [toggle]);

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  return (
    <div className="App">
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 20 }}>
          <Typography> Loading... </Typography>
          <CircularProgress size={20} />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              height: 50,
              mt: 1,
            }}
          >
            {selectedArray.length > 0 && (
              <Button
                size="small"
                variant="contained"
                className="btn"
                sx={{ height: 30 }}
                onClick={handleOpenModal}
              >
                Update Ticket
              </Button>
            )}
          </Box>
          <TableContainer component={Paper} sx={{ width: "max-width" }}>
            <Table>
              <TableHead className="head">
                <TableRow>
                  <TableCell className="box" width={10}></TableCell>
                  <TableCell className="box" width={100}>
                    Ticket Number
                  </TableCell>
                  <TableCell className="box" width={300}>
                    Subject
                  </TableCell>
                  <TableCell className="box" width={110}>
                    Classification
                  </TableCell>
                  <TableCell className="box" width={150}>
                    Owner
                  </TableCell>
                  <TableCell className="box" width={70}>
                    Priority
                  </TableCell>
                  <TableCell className="box" width={90}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ticketList?.map((item, index) => (
                  <TableRow>
                    <TableCell sx={{ p: "0 4px" }} className="box">
                      <Checkbox
                        {...label}
                        width={10}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setSelectedArray([...selectedArray, item.id]);
                          } else {
                            setSelectedArray(
                              selectedArray?.filter((el) => item.id !== el)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ p: "0 4px" }} className="box">
                      <a href={item?.webUrl}>{item.ticketNumber}</a>
                    </TableCell>
                    <TableCell sx={{ p: "0 4px" }} className="box">
                      {item.subject}
                    </TableCell>
                    <TableCell sx={{ p: "0 4px" }} className="box">
                      {item.classification}
                    </TableCell>
                    <TableCell sx={{ p: "0 4px" }} className="box">
                      {/* {item.ticketNumber} */}
                    </TableCell>
                    <TableCell sx={{ p: "0 4px" }} className="box">
                      <span className="small">{item.priority}</span>
                    </TableCell>
                    <TableCell sx={{ p: "0 4px" }} className="box">
                      {item.status}
                    </TableCell>
                  </TableRow>
                ))}

                {/* <TableRow>
              <TableCell className="box">
                <Checkbox {...label} />
              </TableCell>
              <TableCell className="box">
                <a href="#">Ticket 123</a>
              </TableCell>
              <TableCell className="box">Subject</TableCell>
              <TableCell className="box">Classification </TableCell>
              <TableCell className="box">Robert Lee</TableCell>
              <TableCell className="box">
                <span className="small">High</span>
              </TableCell>
              <TableCell className="box">Open</TableCell>
            </TableRow> */}
              </TableBody>
            </Table>
          </TableContainer>

          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <DialogComponent
                handleClose={handleCloseModal}
                tickets={selectedArray}
                setToggle={setToggle}
                toggle={toggle}
              />
            </Box>
          </Modal>
        </>
      )}
    </div>
  );
}

export default App;
