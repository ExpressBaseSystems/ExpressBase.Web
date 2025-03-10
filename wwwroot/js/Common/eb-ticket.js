document.addEventListener('DOMContentLoaded', function () {
    // Define variables for different elements
    const activeTicketsContainer = document.getElementById('tr-container');
    const closedTicketsContainer = document.getElementById('closedtr_container');
    const noActiveTicketsImage = document.getElementById('no-active-tickets');
    const noClosedTicketsImage = document.getElementById('no-closed-tickets');
    const mainContent = document.getElementById('main-content');
    const ticketForm = document.getElementById('ticket-form');
    const createTicketButton = document.getElementById('create-ticket-button');
    const createTicketButtonClosed = document.getElementById('create-ticket-button-closed');
    const backButton = document.getElementById('back-button');
    const submitTicketButton = document.getElementById('submit-ticket-button');
    const confirmationMessage = document.getElementById('confirmation-message');
    const viewActiveTicketButton = document.getElementById('view-active-ticket-button');

    // Function to fetch active bug tickets
    function getBugTickets() {
        console.log("Fetching bug tickets..."); // Debugging line
        $("#tr-container").html(`<p class="nf-window-eptylbl" style="margin:auto;"><i class="fa fa-spinner fa-pulse"></i> Loading...</p>`);

        $.ajax({
            type: "GET",
            url: "/SupportTicket/BugTickets", // Ensure this endpoint is correct
            success: function (response) {
                console.log("Fetched bug tickets:", response); // Debugging log to inspect the response
                try {
                    var data = typeof response === "string" ? JSON.parse(response) : response; // Adjust parsing
                    onGetBugTicketsSuccess(data, true);
                } catch (error) {
                    console.error("Failed to parse response:", error); // Error handling for parsing issues
                    $("#tr-container").html(`<p class="nf-window-eptylbl" style="margin:auto;">Failed to load bug tickets.</p>`);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching bug tickets:", status, error); // Error handling for AJAX call
                $("#tr-container").html(`<p class="nf-window-eptylbl" style="margin:auto;">Failed to load bug tickets.</p>`);
            }
        });
    }


    // Handle successful fetching of bug tickets
    function onGetBugTicketsSuccess(data, onload) {
        // Check if data is valid
        if (!data || !Array.isArray(data)) {
            $("#tr-container").html(`<p class="nf-window-eptylbl" style="margin:auto;">No Active Bug Tickets</p>`);
            return;
        }

        // Store the fetched tickets globally
        window.loadedTickets = data;

        // Draw the tickets on the page
        drawTickets(data, onload);
    }


    function drawTickets(tickets, onload) {
        if (onload) {
            $("#tr-container").empty();

            if (tickets.length > 0) {
                tickets.forEach(ticket => {
                    const relativeTime = getRelativeTime(ticket.lstmodified);

                    $("#tr-container").append(`
                    <li class="ticket-tile" style="background: #DDEBFF; border-radius: 8px; padding: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; flex: 1;">
                            <div style="flex: 1;">
                                <h5 style="color: black; font-weight: 600; margin: 0; font-size: 14px; font-family: 'Roboto';"> <i class="fa fa-bug" style="color: #992727; margin-right:0;"></i> ${ticket.title || "Untitled..."}</h5>
                                <p style="margin: 5px 0;">${ticket.description || "No description available."}</p>
                                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                    <span class="ticket-status" style="background: #4D86D6; color: white; padding: 0px 10px; border-radius: 12px;">
                                        ${ticket.status || "New"}
                                    </span>
                                    <span class="ticket-raised-by" style="color: #555;">Raised by: ${ticket.fullname || "Unknown"}${relativeTime}</span>
                                </div>
                            </div>
                        </div>
                        <!-- Icon to view details -->
                        <button class="view-details-btn" data-ticket-id="${ticket.ticketid}" style="background: none; border: none; color: #787878;  font-size: 19px; cursor: pointer;">
                            <i class="fa fa-chevron-right" style="color:"></i>
                        </button>
                    </li>
                `);
                });
            } else {
                $("#tr-container").append(`<p class="nf-window-eptylbl" style="margin:auto;">No Active Bug Tickets</p>`);
            }
        }
        updateTicketImages();
    }
    document.addEventListener('click', function (event) {
        // Handle click on the ticket tile
        const ticketTile = event.target.closest('.ticket-tile');
        if (ticketTile) {
            // Extract ticket ID from the data attribute of the button within the ticket tile
            const ticketId = ticketTile.querySelector('.view-details-btn').getAttribute('data-ticket-id');

            // Fetch the ticket data based on the ticket ID
            const ticket = getTicketById(ticketId); // Implement this function to fetch the correct ticket details
            console.log(ticket); // For debugging: Log the ticket data fetched

            // Show the ticket form with the fetched ticket details
            populateAndShowTicketForm(ticket);
        }
    });

    function getTicketById(ticketId) {
        const tickets = window.loadedTickets || []; // Ensure tickets are loaded

        // Debugging: Log the tickets and the ticketId to verify
        console.log("Loaded Tickets:", tickets);
        console.log("Clicked Ticket ID:", ticketId);

        // Find the ticket with the matching ticket ID
        const ticket = tickets.find(ticket => ticket.ticketid == ticketId);

        // Debugging: Log the found ticket or the fallback object
        console.log("Found Ticket:", ticket);

        // Return the found ticket or a default ticket if not found
        return ticket || {
            ticketid: ticketId,
            title: "Untitled Ticket",
            description: "No description available.",
            status: "New",
            comments: "No comments yet.",
            priority: "medium",
            type: "bug"
        };
    }

    // Function to activate the Info tab
    function setActiveTab(tabId) {
        document.querySelectorAll('.trfstyled-tab-item a').forEach((link) => {
            link.classList.remove('active');
        });

        const activeTab = document.querySelector(`a[href="${tabId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    function populateAndShowTicketForm(ticket) {

        mainContent.style.display = 'none'; // Hide the main content including headings and tabs
        ticketForm.style.display = 'flex';  // Show the ticket form

        // Enable Comments tab once ticket is populated
        const commentsTabLink = document.querySelector('a[href="#comments-tab"]');
        if (commentsTabLink) {
            commentsTabLink.style.pointerEvents = "auto"; // Enable clicking
            commentsTabLink.classList.remove("disabled"); // Remove the disabled class
        }

        // Update the header to show the Ticket ID
        document.getElementById("ticket-id-header").textContent = `Ticket ID: ${ticket.ticketid || 'N/A'}`;


        // Set Info tab as active
        setActiveTab('#info-tab');

        // Show "Update Ticket" button and hide "Submit Ticket" button
        document.getElementById("update-ticket-button").style.display = "inline-block";
        document.getElementById("submit-ticket-button").style.display = "none";



        //for comment tab  visible 
        //const commentsTabLink = document.querySelector('a[href="#comments-tab"]');
        //const commentsTab = document.getElementById("comments-tab");

        //if (commentsTabLink && commentsTab) {
        //    console.log("Populating Ticket - Showing Comments Tab");

        //    // Show tab link
        //    commentsTabLink.style.display = "block";
        //    commentsTabLink.classList.add("active");

        //    // Show tab content properly
        //    commentsTab.classList.add("show", "active");
        //} else {
        //    console.log("Comments Tab Not Found!");
        //}



        // Populate the form fields with ticket details
        document.getElementById("ticket-title").value = ticket.title || "";
        document.getElementById("ticket-description").value = ticket.description || "";
        document.getElementById("tinf_status").value = ticket.status || "New";
        document.getElementById("tinf_comments").value = ticket.comments || "";
        document.getElementById("tinf_priority").value = ticket.priority || "low";

        // Set the type radio button based on the ticket type
        if (ticket.type === "feature") {
            document.getElementById("tinf_feature").checked = true;
        } else {
            document.getElementById("tinf_bug").checked = true;
        }


        // Clear existing attachments
        document.getElementById('screenshot-container').innerHTML = '';
        document.getElementById('image-thumbnails').innerHTML = '';
        document.getElementById('other-attachments-list').innerHTML = '';

        // Create a popup element for displaying files
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.style.display = 'none';
        popup.style.position = 'fixed';
        popup.style.top = '0';
        popup.style.left = '0';
        popup.style.width = '100%';
        popup.style.height = '100%';
        popup.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        popup.style.justifyContent = 'center';
        popup.style.alignItems = 'center';
        popup.style.zIndex = '1000';

        const popupContent = document.createElement('div');
        popupContent.style.backgroundColor = '#fff';
        popupContent.style.padding = '20px';
        popupContent.style.borderRadius = '5px';
        popupContent.style.width = '600px'; // Set a fixed width for the popup
        popupContent.style.maxWidth = '90%'; // Ensure it doesn't exceed the viewport width
        popupContent.style.maxHeight = '80%'; // Limit the height of the popup
        popupContent.style.overflowY = 'auto'; // Allow scrolling if content exceeds height
        popupContent.style.position = 'relative';

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;'; // Change text content to multiplication sign
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.fontSize = '24px'; // Adjust size as needed
        closeButton.style.border = 'none'; // Remove border
        closeButton.style.backgroundColor = 'transparent'; // Transparent background
        closeButton.style.cursor = 'pointer'; // Change cursor to pointer
        closeButton.style.color = '#007BFF'; // Change color as needed
        closeButton.onclick = function () {
            popup.style.display = 'none';
            // Clear previous content in popupContent
            while (popupContent.firstChild) {
                popupContent.removeChild(popupContent.firstChild);
            }
            popupContent.appendChild(closeButton); // Re-add close button
        };

        popupContent.appendChild(closeButton);
        popup.appendChild(popupContent);
        document.body.appendChild(popup);

        // Check for attachments and populate the respective sections
        if (Array.isArray(ticket.fileuploadlst) && ticket.fileuploadlst.length > 0) {
            ticket.fileuploadlst.forEach((file) => {
                if (file.contentType.startsWith('image/')) {
                    // If the file is an image, show it in the screenshot or image thumbnails
                    const imgElement = document.createElement('img');
                    imgElement.src = `data:${file.contentType};base64,${file.filecollection}`;
                    imgElement.style = 'width: 100px; height: 100px; object-fit: cover; border-radius: 5px; margin: 5px; cursor: pointer;';

                    imgElement.onclick = function () {
                        const displayImage = document.createElement('img');
                        displayImage.src = imgElement.src;
                        displayImage.style.width = '100%'; // Make the displayed image responsive
                        displayImage.style.height = 'auto';
                        while (popupContent.firstChild) {
                            popupContent.removeChild(popupContent.firstChild);
                        }
                        popupContent.appendChild(closeButton); // Re-add close button
                        popupContent.appendChild(displayImage);
                        popup.style.display = 'flex';
                    };

                    if (file.fileName.startsWith('screenshot_')) {
                        // Append to screenshot container
                        document.getElementById('screenshot-container').appendChild(imgElement);
                    } else {
                        // Append to image thumbnails
                        document.getElementById('image-thumbnails').appendChild(imgElement);
                    }
                } else {
                    // For other files, show them in the other attachments list
                    const fileItem = document.createElement('div');
                    fileItem.className = 'attachment-item';
                    fileItem.style = 'display: flex; align-items: center; gap: 10px;';

                    const fileIcon = document.createElement('i');
                    fileIcon.className = 'fa fa-file';
                    fileIcon.style = 'font-size: 24px;';

                    const fileLink = document.createElement('a');
                    fileLink.href = `data:${file.contentType};base64,${file.filecollection}`;
                    fileLink.download = file.fileName;
                    fileLink.textContent = file.fileName;
                    fileLink.style = 'text-decoration: none; color: #007BFF; cursor: pointer;';

                    fileLink.onclick = function (e) {
                        e.preventDefault(); // Prevent default action
                        const displayFile = document.createElement('iframe');
                        displayFile.src = fileLink.href;
                        displayFile.style.width = '100%';
                        displayFile.style.height = '400px'; // Adjust height as necessary
                        while (popupContent.firstChild) {
                            popupContent.removeChild(popupContent.firstChild);
                        }
                        popupContent.appendChild(closeButton); // Re-add close button
                        popupContent.appendChild(displayFile);
                        popup.style.display = 'flex';
                    };

                    fileItem.appendChild(fileIcon);
                    fileItem.appendChild(fileLink);
                    document.getElementById('other-attachments-list').appendChild(fileItem);
                }
            });
        }


        // Add event listener for Open and Comment tabs
        const openTab = document.querySelector('a[href="#open-tab"]');
        const commentsTab = document.querySelector('a[href="#comments-tab"]');

        if (openTab) {
            openTab.addEventListener('click', function () {
                const openTabContent = document.getElementById("open-tab");
                if (openTabContent) {
                    openTabContent.innerHTML = "<p style='text-align:center; font-weight:bold; margin-top:20px;'>Coming Soon...</p>";
                }
            });
        }

        if (commentsTab) {
            commentsTab.addEventListener('click', function () {
                const commentsTabContent = document.getElementById("comments-tab");
                if (commentsTabContent) {
                    commentsTabContent.innerHTML = "<p style='text-align:center; font-weight:bold; margin-top:20px;'>Coming Soon...</p>";
                }
            });
        }

        // Close the popup when clicking outside of it
        popup.onclick = function (e) {
            if (e.target === popup) {
                popup.style.display = 'none';
            }
        };
    }


    // Helper function to convert date to relative time format
    function getRelativeTime(dateString) {
        const date = new Date(dateString); // Parse the date string into a Date object
        const now = new Date(); // Get the current date and time
        const diffInMs = now - date; // Calculate the difference in milliseconds
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`; // Pluralize 'day'
        } else if (diffInHours > 0) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`; // Pluralize 'hour'
        } else if (diffInMinutes > 0) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`; // Pluralize 'minute'
        } else {
            return "just now"; // More precise for recent events
        }
    }



    // Function to update ticket images visibility
    function updateTicketImages() {
        noActiveTicketsImage.style.display = activeTicketsContainer.textContent.trim() ? 'none' : 'block';
        noClosedTicketsImage.style.display = closedTicketsContainer.textContent.trim() ? 'none' : 'block';
    }

    // Function to show the ticket form
    function showTicketForm() {
        mainContent.style.display = 'none'; // Hide the main content including headings and tabs
        ticketForm.style.display = 'flex';  // Show the ticket form
    }

    // Function to show the tickets list
    function showTicketsList() {
        mainContent.style.display = 'flex'; // Show the main content
        ticketForm.style.display = 'none';  // Hide the ticket form
    }

    // Function to view active tickets
    function viewActiveTicket() {
        confirmationMessage.style.display = 'none'; // Hide the confirmation message
        mainContent.style.display = 'flex'; // Show the main content
        const tabContent = document.querySelector('.tab-content');
        const activeTicketsTab = tabContent.querySelector('#alltickets-tab');
        activeTicketsTab.classList.add('active'); // Activate the active tickets tab
        tabContent.querySelector('#closedtickets-tab').classList.remove('active');
    }

    // Event listeners
    createTicketButton.addEventListener('click', function (e) {
        e.preventDefault();
        // Disable Comments tab when creating a new ticket
        const commentsTabLink = document.querySelector('a[href="#comments-tab"]');
        if (commentsTabLink) {
            commentsTabLink.style.pointerEvents = "none";  // Disable clicking
            commentsTabLink.classList.add("disabled"); // Optionally add a disabled class for styling
        }

        // Set Info tab as active
        setActiveTab('#info-tab');

        // Set the header to "New Ticket"
        document.getElementById("ticket-id-header").textContent = "New Ticket";
        document.getElementById("tinf_status").value = "New";
        console.log("Status before submitting:", document.getElementById("tinf_status").value);



        // Show "Submit Ticket" button and hide "Update Ticket" button
        document.getElementById("submit-ticket-button").style.display = "inline-block";
        document.getElementById("update-ticket-button").style.display = "none";

        // Clear title and description
        document.getElementById("ticket-title").value = "";
        document.getElementById("ticket-description").value = "";
        document.getElementById("ticket-title").style.borderColor = "";
        document.getElementById("ticket-description").style.borderColor = "";

        // Clear attachments
        document.getElementById("screenshot-container").innerHTML = ""; // Clear screenshot thumbnails
        document.getElementById("image-thumbnails").innerHTML = ""; // Clear image thumbnails
        document.getElementById("other-attachments-list").innerHTML = ""; // Clear other attachments

        // Hide the "Comments" tab
        //const commentsTabLink = document.querySelector('a[href="#comments-tab"]');
        //const commentsTab = document.getElementById("comments-tab");

        //if (commentsTabLink && commentsTab) {
        //    console.log("Creating New Ticket - Hiding Comments Tab");

        // Hide tab link
        //commentsTabLink.style.display = "none";
        //commentsTabLink.classList.remove("active");

        // Hide tab content properly
        //    commentsTab.classList.remove("show", "active");
        //}

        // Show the ticket form
        showTicketForm();
    });

    createTicketButtonClosed.addEventListener('click', function (e) {
        e.preventDefault();
        // Show the ticket form (if needed)
        showTicketForm();
    });

    backButton.addEventListener('click', function () {
        showTicketsList();
    });
    // Add event listener for the "Update Ticket" button
    document.getElementById('update-ticket-button').addEventListener('click', function (event) {
        event.preventDefault();

        // Collect the ticket ID
        const ticketId = document.getElementById("ticket-id-header").textContent.split(":")[1].trim();

        // Get the form field values
        const title = document.getElementById("ticket-title").value.trim();
        const description = document.getElementById("ticket-description").value.trim();
        let hasErrors = false;

        // Clear previous error messages
        document.getElementById("title-error").textContent = "";
        document.getElementById("description-error").textContent = "";

        // Validate title and description
        if (title === "") {
            document.getElementById("title-error").textContent = "Title is required.";
            document.getElementById("ticket-title").style.borderColor = "red";
            hasErrors = true;
        } else {
            document.getElementById("ticket-title").style.borderColor = "";
        }

        if (description === "") {
            document.getElementById("description-error").textContent = "Description is required.";
            document.getElementById("ticket-description").style.borderColor = "red";
            hasErrors = true;
        } else {
            document.getElementById("ticket-description").style.borderColor = "";
        }

        // Stop submission if there are errors
        if (hasErrors) {
            return;
        }

        // Prepare the form data
        let data = new FormData();
        data.append("ticketId", ticketId);  // Add ticket ID to the form data
        data.append("title", title);
        data.append("description", description);
        data.append("status", document.getElementById("tinf_status").value.trim());
        data.append("priority", document.getElementById("tinf_priority").value.trim());
        data.append("type_f_b", document.querySelector('input[name=tinf_type]:checked').value.trim());
        data.append("solid", document.getElementById("soluid").getAttribute('sol_id'));

        // Attach screenshots (if any)
        const screenshotContainer = document.getElementById('screenshot-container').querySelectorAll('img');
        screenshotContainer.forEach((screenshot, index) => {
            const blob = dataURLToBlob(screenshot.src);
            data.append(`screenshot_${index}`, blob, `screenshot_${index}.png`);
        });

        // Attach uploaded images (if any)
        const imageThumbnails = document.getElementById('image-thumbnails').querySelectorAll('img');
        imageThumbnails.forEach((image, index) => {
            const blob = dataURLToBlob(image.src);
            data.append(`imageUpload_${index}`, blob, `image_${index}.png`);
        });

        // Attach other files (if any)
        const otherAttachments = document.getElementById('other-attachments-list').querySelectorAll('.attachment-item');
        otherAttachments.forEach((attachment, index) => {
            const anchor = attachment.querySelector('a');
            if (anchor) {
                const url = anchor.href;
                const fileName = anchor.download;
                data.append(`attachment_${index}`, url, fileName);
            }
        });

        // Show loader
        $("#eb_common_loader").EbLoader("show");

        // Send the request to update the ticket
        fetch(`/SupportTicket/UpdateTicketDetails/${ticketId}`, {  // Update the backend URL as needed
            method: 'POST',
            body: data
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                $("#eb_common_loader").EbLoader("hide");
                console.log("Ticket updated successfully:", data); // Debugging log

                if (data.successMessage) {
                    showConfirmationMessage();
                } else {
                    alert("Failed to update ticket.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                $("#eb_common_loader").EbLoader("hide");
                alert("Failed to update ticket.");
            });
    });

    // Utility function to convert dataURL to Blob
    function dataURLToBlob(dataURL) {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }


    submitTicketButton.addEventListener('click', function (event) {
        event.preventDefault();

        const title = document.getElementById("ticket-title").value.trim();
        const description = document.getElementById("ticket-description").value.trim();
        const statusInput = document.getElementById("tinf_status");
        statusInput.value = "New";
        const status = statusInput.value; // Ensure variable holds the correct value

        let hasErrors = false;

        document.getElementById("title-error").textContent = "";
        document.getElementById("description-error").textContent = "";

        if (title === "") {
            document.getElementById("title-error").textContent = "Title is required.";
            document.getElementById("ticket-title").style.borderColor = "red";
            hasErrors = true;
        } else {
            document.getElementById("ticket-title").style.borderColor = "";
        }

        if (description === "") {
            document.getElementById("description-error").textContent = "Description is required.";
            document.getElementById("ticket-description").style.borderColor = "red";
            hasErrors = true;
        } else {
            document.getElementById("ticket-description").style.borderColor = "";
        }

        if (hasErrors) {
            return; // Stop submission if there are errors
        }

        let data = new FormData();
        data.append("title", title);
        data.append("description", description);
        data.append("status", status);
        data.append("priority", document.getElementById("tinf_priority").value.trim());
        data.append("type_f_b", document.querySelector('input[name=tinf_type]:checked').value.trim());
        data.append("solid", document.getElementById("soluid").getAttribute('sol_id'));

        // Attach screenshots (if any)
        const screenshotContainer = document.getElementById('screenshot-container').querySelectorAll('img');
        screenshotContainer.forEach((screenshot, index) => {
            const blob = dataURLToBlob(screenshot.src);
            data.append(`screenshot_${index}`, blob, `screenshot_${index}.png`);
        });

        // Attach uploaded images
        const imageThumbnails = document.getElementById('image-thumbnails').querySelectorAll('img');
        imageThumbnails.forEach((image, index) => {
            const blob = dataURLToBlob(image.src);
            data.append(`imageUpload_${index}`, blob, `image_${index}.png`);
        });

        // Attach other files (if any)
        const otherAttachments = document.getElementById('other-attachments-list').querySelectorAll('.attachment-item');
        otherAttachments.forEach((attachment, index) => {
            const anchor = attachment.querySelector('a');
            if (anchor) {
                const url = anchor.href;
                const fileName = anchor.download;
                data.append(`attachment_${index}`, url, fileName);
            }
        });

        $("#eb_common_loader").EbLoader("show");

        fetch("/SupportTicket/SubmitTicketDetails", {
            method: 'POST',
            body: data
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                $("#eb_common_loader").EbLoader("hide");
                console.log("Ticket submitted successfully:", data); // Debugging log

                if (data.successMessage) {
                    showConfirmationMessage();
                } else {
                    alert("Failed to submit ticket.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                $("#eb_common_loader").EbLoader("hide");
                alert("Failed to submit ticket.");
            });
    });

    // Utility function to convert dataURL to Blob
    function dataURLToBlob(dataURL) {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }

    function showConfirmationMessage() {
        ticketForm.style.display = 'none';
        confirmationMessage.style.display = 'block';
    }

    // Event listener for viewing active tickets
    viewActiveTicketButton.addEventListener('click', viewActiveTicket);

    // Trigger fetching of active bug tickets when the page loads
    getBugTickets();
});



// Function to format and display the submission date
function showSubmissionDate() {
    const submissionDateElement = document.getElementById('subDate');

    if (submissionDateElement) {
        const now = new Date();
        const formattedDate = now.toLocaleString(); // Full date and time

        submissionDateElement.textContent = formattedDate;
        console.log(submissionDateElement);
    } else {
        console.error("Element with id 'submissionDate' not found");
    }
}

// Call the function to update the date when the form is loaded
document.addEventListener('DOMContentLoaded', showSubmissionDate);

document.addEventListener('DOMContentLoaded', function () {
    const prioritySelect = document.getElementById('tinf_priority');

    function updatePriorityColor() {
        const selectedOption = prioritySelect.options[prioritySelect.selectedIndex];
        const color = selectedOption.getAttribute('data-color');
        prioritySelect.style.color = selectedOption.style.color = color;
    }

    // Initialize with the default selected option
    updatePriorityColor();

    // Update color on change
    prioritySelect.addEventListener('change', updatePriorityColor);
});

document.addEventListener('DOMContentLoaded', function () {
    // Screenshot button
    const captureScreenshotButton = document.getElementById('capture-screenshot');
    const screenshotContainer = document.getElementById('screenshot-container');

    // Upload image button
    const uploadImageButton = document.getElementById('upload-image-button');
    const uploadImageInput = document.getElementById('upload-image');
    const imageThumbnailsContainer = document.getElementById('image-thumbnails');

    // Other attachments button
    const otherAttachmentsButton = document.getElementById('other-attachments-button');
    const otherAttachmentsInput = document.getElementById('other-attachments');
    const otherAttachmentsList = document.getElementById('other-attachments-list');

    const attachmentPopup = document.getElementById('attachment-popup');
    const attachmentPopupContent = document.getElementById('attachmentPopupContent');
    const closePopupButton = document.querySelector('.attachment-popup-content .close');

    captureScreenshotButton.addEventListener('click', function () {
        // Toggle the tr_window visibility
        toggleTRWindow();

        // Capture screenshot after a brief delay to ensure the window has toggled
        setTimeout(() => {
            html2canvas(document.body).then(canvas => {
                const screenshotURL = canvas.toDataURL();
                appendAttachment(screenshotURL, screenshotContainer, 'screenshot');
            });
        }, 500); // Adjust delay as needed
    });

    function appendAttachment(url, container, type, fileName = null) {
        const attachmentItem = document.createElement('div');
        attachmentItem.classList.add('attachment-item');

        if (type === 'screenshot' || type === 'image') {
            const img = document.createElement('img');
            img.src = url;
            img.style.width = '150px'; // Adjust thumbnail size
            img.style.height = '100px';
            img.style.cursor = 'pointer';
            img.addEventListener('click', function () {
                showAttachmentInPopup(url, type);
            });
            attachmentItem.appendChild(img);
        } else {
            attachmentItem.textContent = fileName;
            attachmentItem.style.padding = '5px';
            attachmentItem.style.border = '1px solid #ccc';
            attachmentItem.style.borderRadius = '5px';
        }

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'x';
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', function () {
            container.removeChild(attachmentItem);
        });

        attachmentItem.appendChild(removeBtn);
        container.appendChild(attachmentItem);
    }

    function showAttachmentInPopup(url, type) {
        if (type === 'image' || type === 'screenshot') {
            attachmentPopupContent.innerHTML = `<img src="${url}" style="max-width: 100%; max-height: 100%; transition: transform 0.3s ease;">`;
        } else {
            attachmentPopupContent.innerHTML = `<p>File: <a href="${url}" download>Download</a></p>`;
        }
        attachmentPopup.style.display = 'flex'; // Show the popup
    }

    closePopupButton.addEventListener('click', function () {
        attachmentPopup.style.display = 'none'; // Hide the popup
    });

    // Hide popup when clicking outside of content
    attachmentPopup.addEventListener('click', function (event) {
        if (event.target === attachmentPopup) {
            attachmentPopup.style.display = 'none';
        }
    });

    // Toggle the visibility of the tr_window
    function toggleTRWindow() {
        const trWindow = $('#tr-window.eb-notification-window');
        const trFade = $('#tr-window-fade');

        if (!trWindow.is(':visible')) {
            trFade.show();
            trWindow.show('slide', { direction: 'right' });
        } else {
            trFade.hide();
            trWindow.hide();
        }
    }

    // Upload image
    uploadImageButton.addEventListener('click', function () {
        uploadImageInput.click();
    });

    uploadImageInput.addEventListener('change', function (event) {
        const files = event.target.files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = function (e) {
                appendAttachment(e.target.result, imageThumbnailsContainer, 'image');
            };
            reader.readAsDataURL(file);
        }
        uploadImageInput.value = ''; // Reset input
    });

    // Other attachments
    otherAttachmentsButton.addEventListener('click', function () {
        otherAttachmentsInput.click();
    });

    otherAttachmentsInput.addEventListener('change', function (event) {
        const files = event.target.files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = file.name;
            appendAttachment(URL.createObjectURL(file), otherAttachmentsList, 'attachment', fileName);
        }
        otherAttachmentsInput.value = ''; // Reset input
    });
});

//document.addEventListener('DOMContentLoaded', function () {
//    document.getElementById('send-comment-btn').addEventListener('click', function (event) {
//        event.preventDefault(); // Prevent any default form submission action

//        const commentInput = document.getElementById('ticket-comments');
//        const commentText = commentInput.value.trim();
//        if (commentText) {
//            const username = "User"; // Replace with dynamic username if available
//            const timestamp = new Date().toLocaleString();

//            const commentBox = document.createElement('div');
//            commentBox.className = 'trcmnt_comment-box';

//            const commentContent = `
//                <small class="trcmnt_username">${username}</small>
//                <small class="trcmnt_timestamp">${timestamp}</small>
//                <p class="trcmnt_para">${commentText}</p>
//            `;

//            commentBox.innerHTML = commentContent;
//            document.getElementById('comments-display').appendChild(commentBox);

//            commentInput.value = ''; // Clear the input field
//        }
//    });
//});
