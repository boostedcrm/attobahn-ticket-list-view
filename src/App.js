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
  const [entityId, setEntityId] = useState();
  const [userList, setUserList] = useState();
  const [toggle, setToggle] = useState(false);
  const [selectedArray, setSelectedArray] = useState([]);
  const [ticketList, setTicketList] = useState([]);
  // const [vendor, setVendor] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const [openModalNotification, setOpenModalNotification] = useState(false);
  const handleOpenModalNotification = () => setOpenModalNotification(true);
  const handleCloseModalNotification = () => {
    setOpenModalNotification(false);
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
      setLoading(true);
      // console.log(data);
      setEntityId(data?.EntityId);
      // await ZOHO.CRM.API.getRecord({
      //   Entity: data.Entity,
      //   RecordID: data?.EntityId,
      // }).then(async function (data) {
      //   let result = data?.data?.[0];
      //   if (result?.Project_Assignment?.id) {
      //     await ZOHO.CRM.API.getRecord({
      //       Entity: "Project_Assignment",
      //       RecordID: result?.Project_Assignment?.id,
      //     }).then(async function (output) {
      //       let pa_resp = output?.data?.[0];
      //       if (pa_resp?.Vendor?.id) {
      //         await ZOHO.CRM.API.getRecord({
      //           Entity: "Vendors",
      //           RecordID: pa_resp?.Vendor?.id,
      //         }).then(async function (vendorOutput) {
      //           let vendor_resp = vendorOutput?.data?.[0];
      //           setVendor(vendor_resp);
      //         });
      //       }
      //     });
      //   }
      // });
      await ZOHO.CRM.API.getAllUsers({ Type: "AllUsers" }).then(function (
        data
      ) {
        const users = data?.users;
        const activeUserList = users?.filter(
          (user) => user?.status === "active"
        );
        let user_array = [];
        activeUserList?.forEach((element) => {
          user_array.push({ title: element?.full_name, email: element?.email });
        });
        setUserList(user_array);
      });
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
          let resp = JSON.parse(
            result?.details?.output ? result?.details?.output : ""
          );
          // console.log(resp?.list);
          let sortedList = resp?.list?.sort((a, b) => {
            if (a.status === "Open" && b.status !== "Open") {
              return -1; // 'Open' comes first
            } else if (a.status !== "Open" && b.status === "Open") {
              return 1; // 'Open' comes first
            } else if (a.status === "Closed" && b.status !== "Closed") {
              return 1; // 'Closed' comes last
            } else if (a.status !== "Closed" && b.status === "Closed") {
              return -1; // 'Closed' comes last
            } else {
              return 0; // Maintain original order for other statuses
            }
          });
          setTicketList(sortedList);
          setLoading(false);
        }
      );
    };

    if (entityId) fetchUpdateData();
  }, [entityId, toggle]);

  return (
    <div className="App">
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 20 }}>
          <Typography> Loading... </Typography>
          <CircularProgress size={20} />
        </Box>
      ) : (
        <>
          {selectedArray?.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                my: 2,
              }}
            >
              <Button
                size="small"
                variant="contained"
                sx={{ width: 180, mr: 1.3 }}
                onClick={handleOpenModalNotification}
              >
                Send Notification
              </Button>
              <Button
                size="small"
                variant="contained"
                sx={{ width: 180 }}
                onClick={handleOpenModal}
              >
                Update Ticket
              </Button>
            </Box>
          )}
          {/* {JSON.stringify(userList)} */}
          {ticketList?.length > 0 ? (
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
                    <TableCell align="left" width={10}></TableCell>
                    <TableCell align="left" width={90}>
                      Status
                    </TableCell>
                    <TableCell align="left" width={100}>
                      Ticket Number
                    </TableCell>
                    <TableCell align="left" width={300}>
                      Subject
                    </TableCell>
                    <TableCell align="left" width={110}>
                      Classification
                    </TableCell>
                    <TableCell align="left" width={150}>
                      Owner
                    </TableCell>
                    <TableCell align="left" width={70}>
                      Priority
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ticketList?.map((item, index) => (
                    <TableRow>
                      <TableCell>
                        <Checkbox
                          {...label}
                          width={10}
                          checked={selectedArray?.includes(item?.id)}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setSelectedArray([...selectedArray, item?.id]);
                            } else {
                              setSelectedArray(
                                selectedArray?.filter((el) => item?.id != el)
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell align="left">{item?.status}</TableCell>
                      <TableCell align="left">
                        <a href={item?.webUrl} target="_blank">
                          {item?.ticketNumber}
                        </a>
                      </TableCell>
                      <TableCell align="left">{item?.subject}</TableCell>
                      <TableCell align="left">{item?.classification}</TableCell>
                      <TableCell align="left">
                        {`${
                          item?.assignee?.firstName
                            ? item?.assignee?.firstName
                            : ""
                        } ${
                          item?.assignee?.lastName
                            ? item?.assignee?.lastName
                            : ""
                        }`}
                      </TableCell>
                      <TableCell align="left">{item?.priority}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 20 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {" "}
                No ticket available for this milestone.{" "}
              </Typography>
            </Box>
          )}

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
                setSelectedArray={setSelectedArray}
                setToggle={setToggle}
                toggle={toggle}
                setOpenSnackbar={setOpenSnackbar}
                setSeverity={setSeverity}
                setSnackbarMessage={setSnackbarMessage}
              />
            </Box>
          </Modal>

          <Modal
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
          </Modal>
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
