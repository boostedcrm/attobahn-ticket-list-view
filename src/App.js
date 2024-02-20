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
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";

import Button from "@mui/material/Button";
import DialogComponent from "./DialogComponent";
import NotificationSelector from "./NotificationSelector";
import dayjs from "dayjs";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "none",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};

const ZOHO = window.ZOHO;

function App() {
  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  const [zohoInitialized, setZohoInitialized] = useState();
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState();
  const [entityId, setEntityId] = useState();
  const [recordResp, setRecordResp] = useState();
  const [toggle, setToggle] = useState(false);
  const [milestoneConfirmation, setMilestoneConfirmation] = useState([]);
  const [deliverablesConfirmation, setDeliverablesConfirmation] = useState([]);
  const [ticketList, setTicketList] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("error");

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", async function (data) {
      setEntity(data?.Entity);
      setEntityId(data?.EntityId);
    });

    ZOHO.embeddedApp.init().then(() => {
      setZohoInitialized(true);
    });
  }, []);

  useEffect(() => {
    const getUpdateData = async () => {
      setLoading(true);
      await ZOHO.CRM.API.getRecord({
        Entity: entity,
        RecordID: entityId,
      }).then(async function (data) {
        let result = data?.data[0];
        setRecordResp(result);
        if (result?.Milestone_Type === "Deliverables") {
          setDeliverablesConfirmation(result?.Deliverables_List);
          setLoading(false);
        }
        if (result?.Milestone_Type === "Milestone") {
          let totalTickets = [];
          let milestoneConfirmationList = result?.Milestone_Confirmation;
          let finalConfirmationList = [];
          if (milestoneConfirmationList?.length > 0) {
            let func_name = "Zoho_desk_ticket_handle_from_milestones";
            let req_data = {
              get_tickets: true,
              milestone_id: entityId,
            };
            await ZOHO.CRM.FUNCTIONS.execute(func_name, req_data).then(
              async function (result) {
                let resp = JSON.parse(
                  result?.details?.output ? result?.details?.output : ""
                );
                totalTickets = resp?.list;
              }
            );
            if (totalTickets?.length > 0) {
              milestoneConfirmationList?.forEach((element) => {
                let allTikets = [];
                if (element?.Tickets && element?.Tickets.trim() !== "") {
                  allTikets = element?.Tickets.split(", ");
                }
                if (allTikets?.length > 0) {
                  let openTicketsCount = 0;
                  let recentClosedTime = null;

                  for (let i = 0; i < totalTickets?.length; i++) {
                    let ticket = totalTickets[i];
                    let ticketNo = "" + ticket.ticketNumber;
                    if (allTikets.includes(ticketNo)) {
                      if (ticket.status !== "Closed") {
                        openTicketsCount++;
                      } else {
                        if (
                          recentClosedTime === null ||
                          ticket.closedTime > recentClosedTime
                        ) {
                          recentClosedTime = ticket.closedTime;
                        }
                      }
                    }
                  }
                  element.openTickets = openTicketsCount;
                  element.closedTime = recentClosedTime;
                  finalConfirmationList.push(element);
                } else {
                  finalConfirmationList.push(element);
                }
              });
              setMilestoneConfirmation(finalConfirmationList);
              setLoading(false);
            } else {
              setMilestoneConfirmation(finalConfirmationList);
              setLoading(false);
            }
          } else {
            setMilestoneConfirmation(finalConfirmationList);
            setLoading(false);
          }
        }
      });
    };

    if (entity && entityId) getUpdateData();
  }, [entity, entityId, toggle]);

  const isLink = (text) => {
    // Regular expression to match common URL patterns
    var urlPattern =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;

    // Test if the text matches the URL pattern
    return urlPattern.test(text);
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
          {recordResp?.Milestone_Type === "Deliverables" ? (
            deliverablesConfirmation?.length > 0 ? (
              <TableContainer
                sx={{ mt: 2, boxShadow: 0, height: 400 }}
                component={Paper}
              >
                <Table
                  sx={{ minWidth: 650 }}
                  size="small"
                  aria-label="simple table"
                >
                  <TableHead className="head">
                    <TableRow sx={{ bgcolor: "#a4aaab" }}>
                      <TableCell align="left" width={50}>
                        Category
                      </TableCell>
                      <TableCell align="left" width={400}>
                        Description
                      </TableCell>
                      <TableCell align="left" width={250}>
                        Location
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deliverablesConfirmation?.map((item, index) => (
                      <TableRow>
                        <TableCell align="left">{item?.Category}</TableCell>
                        <TableCell align="left">{item?.Description}</TableCell>
                        <TableCell align="left">
                          {isLink(item?.Location) ? (
                            <a href={item?.Location} target="_blank">
                              {item?.Location}
                            </a>
                          ) : (
                            item?.Location
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 20 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {" "}
                  No Confirmation available for this milestone.{" "}
                </Typography>
              </Box>
            )
          ) : (
            <></>
          )}

          {recordResp?.Milestone_Type === "Milestone" ? (
            milestoneConfirmation?.length > 0 ? (
              <TableContainer
                sx={{ mt: 2, boxShadow: 0, height: 400 }}
                component={Paper}
              >
                <Table
                  sx={{ minWidth: 650 }}
                  size="small"
                  aria-label="simple table"
                >
                  <TableHead className="head">
                    <TableRow sx={{ bgcolor: "#a4aaab" }}>
                      <TableCell align="left" width={50}>
                        Confirmation Time
                      </TableCell>
                      <TableCell align="left" width={400}>
                        Description
                      </TableCell>
                      <TableCell align="left" width={100}>
                        All Tickets
                      </TableCell>
                      <TableCell align="left" width={40}>
                        Open Tickets
                      </TableCell>
                      <TableCell align="left" width={100}>
                        Status
                      </TableCell>
                      <TableCell align="left" width={50}>
                        Completed Time
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* {JSON.stringify(milestoneConfirmation)} */}
                    {milestoneConfirmation?.map((item, index) => (
                      <TableRow>
                        <TableCell sx={{ verticalAlign: "top" }} align="left">
                          {dayjs(item?.Confirmation_Date_Time).format(
                            "MM-DD-YYYY HH:mm"
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ verticalAlign: "top", whiteSpace: "pre-line" }}
                          align="left"
                        >
                          {item?.Description}
                        </TableCell>
                        <TableCell sx={{ verticalAlign: "top" }} align="left">
                          {item?.Tickets}
                        </TableCell>
                        <TableCell sx={{ verticalAlign: "top" }} align="left">
                          {item?.openTickets}
                        </TableCell>
                        <TableCell sx={{ verticalAlign: "top" }} align="left">
                          {item?.openTickets === 0 && "Complete"}
                          {item?.openTickets > 0 && "Accepted w/Punchlist"}
                        </TableCell>
                        <TableCell sx={{ verticalAlign: "top" }} align="left">
                          {item?.openTickets === 0 &&
                            dayjs(item?.closedTime).format("MM-DD-YYYY HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 20 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {" "}
                  No Confirmation available for this milestone.{" "}
                </Typography>
              </Box>
            )
          ) : (
            <></>
          )}

          {/* <Modal
            open={openModalNotification}
            onClose={handleCloseModalNotification}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <NotificationSelector
                handleClose={handleCloseModalNotification}
                userList={userList}
                tickets={selectedArray}
                ticketList={ticketList}
                setSelectedArray={setSelectedArray}
                // vendor={vendor}
                setOpenSnackbar={setOpenSnackbar}
                setSeverity={setSeverity}
                setSnackbarMessage={setSnackbarMessage}
              />
            </Box>
          </Modal> */}
        </>
      )}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3800}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
