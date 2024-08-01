import * as React from "react";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import {
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
} from "@mui/material";

const ZOHO = window.ZOHO;

export default function NotificationSelector({
  handleClose,
  userList,
  tickets,
  ticketList,
  setSelectedArray,
  setOpenSnackbar,
  setSeverity,
  setSnackbarMessage,
}) {
  const [loading, setLoading] = React.useState(false);
  const [selectedPerson, setSelectedPerson] = React.useState([]);

  const [vendorChecked, setVendorChecked] = React.useState(true);

  const [vendorList, setVendorList] = React.useState([]);
  const [contactList, setContactList] = React.useState([]);
  const [selectedContacts, setSelectedContacts] = React.useState([]);

  React.useEffect(() => {
    const fetchVendor = async () => {
      let allVendors = [];
      await ZOHO.CRM.API.getAllRecords({
        Entity: "Vendors",
        sort_order: "asc",
        per_page: 200,
        page: 1,
      }).then(async function (data) {
        allVendors = data?.data || [];
      });

      await ZOHO.CRM.API.getAllRecords({
        Entity: "Vendors",
        sort_order: "asc",
        per_page: 200,
        page: 2,
      }).then(async function (data) {
        let ven = data?.data || [];
        allVendors = [...allVendors, ...ven];
      });

      let filteredVendors = allVendors?.filter(
        (item) =>
          !item?.Vendor_Type_New?.includes("Subscription") &&
          item?.Vendor_Status === "Approved"
      );
      console.log(filteredVendors);
      setVendorList(filteredVendors);
    };
    fetchVendor();
  }, []);

  const handleChange = (event) => {
    setVendorChecked(event.target.checked);
  };

  const fetchRelatedContacts = async (id) => {
    if (id) {
      setSelectedContacts([]);
      await ZOHO.CRM.API.getRelatedRecords({
        Entity: "Vendors",
        RecordID: id,
        RelatedList: "Contacts",
        page: 1,
        per_page: 200,
      }).then(function (data) {
        setContactList(data?.data || []);
      });
    } else {
      setContactList([]);
      setSelectedContacts([]);
    }
  };

  const handleSendNotification = async () => {
    let otherVendorContactEmails = [];
    if (selectedContacts?.length > 0) {
      selectedContacts?.forEach((el) => {
        if (el?.Email) {
          otherVendorContactEmails.push(el?.Email);
        }
      });
    }
    // let findVendor = selectedPerson?.find(
    //   (item) => item.email === "vendor@gmail.com"
    // );
    let ticket_id_email = [];
    if (vendorChecked) {
      ticketList.forEach((element) => {
        if (tickets.includes(element.id)) {
          ticket_id_email.push({
            id: element.id,
            subject: element?.subject,
            ticketNumber: element?.ticketNumber,
            description: element?.description,
            email: element?.email || null,
          });
        }
      });
    } else {
      ticketList.forEach((element) => {
        if (tickets.includes(element.id)) {
          ticket_id_email.push({
            id: element.id,
            subject: element?.subject,
            ticketNumber: element?.ticketNumber,
            description: element?.description,
            email: null,
          });
        }
      });
    }
    // let withoutVendorEmail = selectedPerson?.filter(
    //   (item) => item.email !== "vendor@gmail.com"
    // );
    let func_name = "Zoho_desk_ticket_handle_from_milestones";
    let selectedPersonEmails =
      selectedPerson?.length > 0
        ? selectedPerson?.map((item) => item?.email)
        : [];
    let totalEmails = [...selectedPersonEmails, ...otherVendorContactEmails];
    let req_data = {
      send_notification: true,
      tickets: JSON.stringify(ticket_id_email),
      emails: JSON.stringify(totalEmails),
    };
    setLoading(true);
    await ZOHO.CRM.FUNCTIONS.execute(func_name, req_data).then(async function (
      result
    ) {
      let resp = JSON.parse(result?.details?.output);
      if (resp?.status === "success") {
        setTimeout(() => {
          setSelectedArray([]);
          handleClose();
          setLoading(false);
          setSeverity("success");
          setSnackbarMessage("Notification sent successfully");
          setOpenSnackbar(true);
        }, 2000);
      } else {
        setLoading(false);
        setSeverity("error");
        setSnackbarMessage("Something went wrong..!");
        setOpenSnackbar(true);
      }
    });
  };

  return (
    <React.Fragment>
      <Box sx={{ width: 500 }}>
        <FormControlLabel
          control={
            <Checkbox
              sx={{ ml: 1 }}
              checked={vendorChecked}
              onChange={handleChange}
              inputProps={{ "aria-label": "controlled" }}
            />
          }
          label="Vendor Ticket Contact"
        />

        <DialogContent sx={{ px: 1 }}>
          <Autocomplete
            multiple
            id="tags-outlined"
            // limitTags={3}
            options={userList}
            getOptionLabel={(option) => option?.title}
            value={selectedPerson}
            onChange={(event, newValue) => {
              setSelectedPerson(newValue);
            }}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Send To Active Users"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </DialogContent>
        <DialogContent sx={{ px: 1 }}>
          <Autocomplete
            id="tags-outlined"
            options={vendorList}
            getOptionLabel={(option) => option?.Vendor_Name}
            onChange={(event, newValue) => {
              fetchRelatedContacts(newValue?.id);
            }}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Vendors"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </DialogContent>
        <DialogContent sx={{ px: 1 }}>
          <Autocomplete
            multiple
            id="tags-outlined"
            // limitTags={3}
            options={contactList}
            getOptionLabel={(option) => option?.Full_Name}
            value={selectedContacts}
            onChange={(event, newValue) => {
              setSelectedContacts(newValue);
            }}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Vendor Contacts"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ width: 95, mr: 1 }}
            variant="outlined"
            size="small"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            sx={{ width: 95 }}
            variant="contained"
            size="small"
            disabled={
              (selectedPerson?.length < 1 && selectedContacts?.length < 1) ||
              loading
            }
            onClick={handleSendNotification}
          >
            {loading ? <CircularProgress size={21} /> : "Send"}
          </Button>
        </DialogActions>
        {/* {JSON.stringify(vendorChecked)}
        {JSON.stringify(selectedPerson)} */}
      </Box>
    </React.Fragment>
  );
}
