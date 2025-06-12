
let selectedAttachments = []; // Store non-image attachments globally
let userMap = {}; // Global object to store ID -> Name mapping
let globalTicketId = null;
let lastCommentCount = 0;
let lastCommentSender = "";
let pollingIntervalId = null; // ← track the interval globally
let currentConsoleType = "Unknown";





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
    const raisingYes = document.getElementById("tinf_raising_yes");
    const raisingNo = document.getElementById("tinf_raising_self");
    const namesDropdown = document.getElementById("tinf_names");
    let cachedUsers = null;
    let currentUserName = document.getElementById('submitted-by')?.textContent.trim() || "";
    let currentUserid = document.getElementById('Uid')?.textContent.trim() || "";







    // Function to fetch active bug tickets
    function getBugTickets() {
        console.log("Fetching bug tickets...");

        $("#tr-container").html(`<p class="nf-window-eptylbl" style="margin:auto;">
        <i class="fa fa-spinner fa-pulse"></i> Loading...</p>`);

        $.ajax({
            type: "GET",
            url: "/SupportTicket/BugTickets", // Make sure this matches your controller
            success: function (response) {
                console.log("Fetched bug tickets:", response);

                try {
                    var data = typeof response === "string" ? JSON.parse(response) : response;

                    var activeTickets = data.activeTickets || [];
                    var closedTickets = data.closedTickets || [];

                    // You can pass both lists to your rendering function
                    onGetBugTicketsSuccess(activeTickets, closedTickets);

                } catch (error) {
                    console.error("Failed to parse response:", error);
                    $("#tr-container").html(`<p class="nf-window-eptylbl" style="margin:auto;">Failed to load bug tickets.</p>`);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching bug tickets:", status, error);
                $("#tr-container").html(`<p class="nf-window-eptylbl" style="margin:auto;">Failed to load bug tickets.</p>`);
            }
        });
    }

    function getTicketsById(ticketId, callback) {
        $.ajax({
            url: "/SupportTicket/GetTicketById",
            type: "GET",
            data: { ticketId: ticketId },
            success: function (response) {
                if (response && response.ticketid) {
                    callback(response);
                } else {
                    console.error("Ticket not found or incomplete:", response);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching ticket:", status, error);
            }
        });
    }

    function fetchUsers() {
        return new Promise((resolve, reject) => {
            if (cachedUsers) {
                console.log("Using cached users...");
                populateDropdown(cachedUsers);
                resolve(); // ✅ immediately resolve
                return;
            }

            const cidElement = document.getElementById("soluid");

            if (!cidElement) {
                console.warn("CID element not found in the DOM.");
                reject("CID element not found");
                return;
            }

            const cidValue = cidElement.getAttribute("sol_id") ? cidElement.getAttribute("sol_id").trim() : "";

            if (!cidValue) {
                console.warn("CID is empty or undefined. Skipping fetch.");
                reject("CID is empty");
                return;
            }

            const dropdown = $("#tinf_names");
            dropdown.empty().append('<option>Loading...</option>');

            $.ajax({
                url: "/SupportTicket/GetUsers",
                type: "GET",
                data: { cid: cidValue },
                success: function (data) {
                    console.log("Users fetched successfully:");
                    cachedUsers = data;
                    populateDropdown(data);
                    if (document.getElementById("tinf_raising_yes").checked) {
                        dropdown.show();
                    }
                    resolve(); // ✅ done fetching
                },
                error: function (xhr, status, error) {
                    console.error("Error fetching users:", xhr.status, xhr.responseText);
                    alert("Failed to load user names.");
                    reject(error);
                }
            });
        });
    }

    function getTicketComments(ticketId) {
        console.log("Fetching comments for Ticket ID:", ticketId);

        const commentsDisplay = document.getElementById('comments-display');
       

        commentsDisplay.innerHTML = `<p style="text-align:center; margin-top:20px;">
        <i class="fa fa-spinner fa-pulse"></i> Loading comments...</p>`;

        $.ajax({
            type: "GET",
            url: `/SupportTicket/CommentsByTicket?tktno=${ticketId}`,
            success: function (response) {
                console.log("Fetched comments:", response);

                commentsDisplay.innerHTML = ""; // Clear previous

                if (response.success && Array.isArray(response.comments)) {
                    if (response.comments.length === 0) {
                        lastCommentCount = response.comments.length;
                        commentsDisplay.innerHTML = `<p style="color: gray;">No comments found.</p>`;
                        return;
                    }

                    response.comments.forEach(comment => {
                        const timestamp = new Date(comment.createdAt).toLocaleString();

                        const commentBox = document.createElement('div');
                        commentBox.className = 'trcmnt_comment-box';
                        commentBox.innerHTML = `
                        <small class="trcmnt_username">${comment.userName}</small>
                        <small class="trcmnt_timestamp">${timestamp}</small>
                        <p class="trcmnt_para">${comment.commentText}</p>
                    `;

                        commentsDisplay.appendChild(commentBox);
                    });
                    setTimeout(() => {
                        commentsDisplay.scrollTop = commentsDisplay.scrollHeight;
                    }, 100);
                } else {
                    commentsDisplay.innerHTML = `<p style="color: red;">Failed to load comments.</p>`;
                }
            },
            error: function (xhr, status, error) {
                console.error("Error loading comments:", error);
                commentsDisplay.innerHTML = `<p style="color: red;">Error loading comments.</p>`;
            }
        });
    };


    function pollForNewComments(ticketId, currentUserid) {
        if (!ticketId || !currentUserid) return;

        if (pollingIntervalId) {
            clearInterval(pollingIntervalId);
        }

        pollingIntervalId = setInterval(() => {
            $.ajax({
                type: "GET",
                url: `/SupportTicket/CommentsByTicket?tktno=${ticketId}`,
                success: function (response) {
                    if (response.success && Array.isArray(response.comments)) {
                        const newCount = response.comments.length;

                        if (newCount > lastCommentCount) {
                            const latestComment = response.comments[response.comments.length - 1];

                            if (newCount > lastCommentCount) {
                                const latestComment = response.comments[response.comments.length - 1];

                                const isOwnComment =
                                    latestComment.userId === currentUserid &&
                                    latestComment.consoleType === currentConsoleType;

                                if (!isOwnComment) {
                                    document.getElementById("new-comment-indicator").style.display = "inline";
                                    console.log("🔔 New comment from another user:", latestComment.userName);
                                } else {
                                    console.log("💬 Ignored comment from same user or console.");
                                }

                                lastCommentCount = newCount;
                            }

                        }
                    }
                },
                error: function (err) {
                    console.warn("Polling failed:", err);
                }
            });
        }, 5000); // every 5 sec
    }





    // Event listener for radio buttons
    document.querySelectorAll('input[name="tinf_raising"]').forEach((radio) => {
        radio.addEventListener('change', function () {
            const dropdown = document.getElementById("tinf_names");

            if (this.value === "yes") {
                dropdown.style.display = "block"; // Show dropdown when "Yes" is selected
                fetchUsers(); // Fetch and populate users
            } else {
                dropdown.style.display = "none"; // Hide dropdown when "No" is selected
            }
        });
    });

    function populateDropdown(data) {
        if (!data || Object.keys(data).length === 0) {
            console.warn("No users available to populate the dropdown.");
            return;
        }

        const dropdown = $("#tinf_names");
        dropdown.empty().append('<option value="">Select Name</option>');

        $.each(data, function (userId, userName) {
            dropdown.append(`<option value="${userId}">${userName}</option>`);
            userMap[userId] = userName; // Store ID-to-Name mapping

        });

        console.log("Dropdown updated with users:", $("#tinf_names").html());
    }



    // Handle successful fetching of bug tickets
    function onGetBugTicketsSuccess(activeTickets, closedTickets) {

        window.loadedTickets = [...activeTickets, ...closedTickets];


        // Handle Active Tickets
        if (!activeTickets || !Array.isArray(activeTickets) || activeTickets.length === 0) {
            $("#tr-container").html(`<p class="nf-window-eptylbl" style="margin:auto;">No Active Bug Tickets</p>`);
            $("#no-active-tickets").show();
        } else {
            $("#no-active-tickets").hide();
            drawTickets("#tr-container", activeTickets, true);
        }

        // Handle Closed Tickets
        if (!closedTickets || !Array.isArray(closedTickets) || closedTickets.length === 0) {
            $("#closedtr_container").html(`<p class="nf-window-eptylbl" style="margin:auto;">No Closed Bug Tickets</p>`);
            $("#no-closed-tickets").show();
        } else {
            $("#no-closed-tickets").hide();
            drawTickets("#closedtr_container", closedTickets, true);
        }
    }

    const statusColors = {
        "Assigned": "#4D86D6",
        "Need more Info": "#D0463D",
        "Rejected": "#505050",
        "Resolved": "#2BB730",
        "New": "#E0C04D",
        "Reopened": "#8950B2",
        "Deferred": "#282828"
    };

    function drawTickets(containerSelector, tickets, onload) {
        if (onload) {
            $(containerSelector).empty();

            if (tickets.length > 0) {
                tickets.forEach(ticket => {
                    const relativeTime = getRelativeTime(ticket.lstmodified);
                    const status = ticket.status || "New";
                    const statusColor = statusColors[status] || "#999"; // fallback color

                    $(containerSelector).append(`
                    <li class="ticket-tile" style="background: #DDEBFF; border-radius: 8px; padding: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; flex: 1;">
                            <div style="flex: 1;">
                                <h5 style="color: black; font-weight: 600; margin: 0; font-size: 14px; font-family: 'Roboto';">
                                    <i class="fa fa-bug" style="color: #992727; margin-right:0;"></i> ${ticket.title || "Untitled..."}
                                </h5>
                                <p style="margin: 5px 0;">${ticket.description || "No description available."}</p>
                                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                    <span class="ticket-status" style="background: ${statusColor}; color: white; padding: 0px 10px; border-radius: 12px;">
                                        ${status}
                                    </span>
                                    <span class="ticket-raised-by" style="color: #555;">Raised by: ${ticket.fullname || "Unknown"}${relativeTime}</span>
                                </div>
                            </div>
                        </div>
                        <!-- Icon to view details -->
                        <button class="view-details-btn" data-ticket-id="${ticket.ticketid}" style="background: none; border: none; color: #787878; font-size: 19px; cursor: pointer;">
                            <i class="fa fa-chevron-right"></i>
                        </button>
                    </li>
                `);
                });
            } else {
                $(containerSelector).append(`<p class="nf-window-eptylbl" style="margin:auto;">No Tickets</p>`);
            }
        }
        updateTicketImages();
    }

    document.addEventListener('click', function (event) {
        // Handle click on the ticket tile
        const ticketTile = event.target.closest('.ticket-tile');
        if (ticketTile) {
            // Extract ticket ID from the data attribute of the button within the ticket tile
            const btn = ticketTile.querySelector('.view-details-btn');
            if (!btn) {
                console.warn('No .view-details-btn found inside .ticket-tile');
                return;
            }

            const ticketId = btn.getAttribute('data-ticket-id');
            if (!ticketId) {
                console.warn('No data-ticket-id found on .view-details-btn');
                return;
            }

            console.log("Clicked Ticket ID:", ticketId); // Debug

            // Fetch the ticket data from the backend asynchronously
            getTicketsById(ticketId, function (ticket) {
                console.log("Ticket fetched from backend:", ticket); // Debug
                populateAndShowTicketForm(ticket);
            });
        }
    });




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
        globalTicketId = ticket.ticketid;
        pollForNewComments(globalTicketId, currentUserName);



        // Set Info tab as active
        setActiveTab('#info-tab');

        // Show "Update Ticket" button and hide "Submit Ticket" button
        document.getElementById("update-ticket-button").style.display = "inline-block";
        document.getElementById("submit-ticket-button").style.display = "none";

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

       const dropdown = $("#tinf_names");
        const onbehalfValue = ticket.onbehalf;

        if (onbehalfValue && onbehalfValue !== "0" && onbehalfValue !== 0) {
            document.getElementById("tinf_raising_yes").checked = true;
            document.getElementById("tinf_raising_self").checked = false;

            const handleUserSelection = () => {
                dropdown.show();
                dropdown.val(onbehalfValue);
                const selectedName = userMap[onbehalfValue] || onbehalfValue;
                $("#display-onbehalf-name").text(selectedName);
            };

            if (!cachedUsers) {
                fetchUsers().then(handleUserSelection);
            } else {
                handleUserSelection();
            }
        } else {
            document.getElementById("tinf_raising_self").checked = true;
            document.getElementById("tinf_raising_yes").checked = false;

            dropdown.hide();
            dropdown.val("");
            $("#display-onbehalf-name").text("");
        }

        // Clear existing attachments
        document.getElementById('screenshot-container').innerHTML = '';
        document.getElementById('image-thumbnails').innerHTML = '';
        document.getElementById('other-attachments-list').innerHTML = '';

        const isDeveloper = window.ViewBag && window.ViewBag.wc === "dc";
        const isUser = window.ViewBag && window.ViewBag.wc === "uc";
        console.log("Console Type:", isDeveloper ? "Developer" : isUser ? "User" : "Unknown");
        console.log("Current Username:", currentUserName);
        if (isDeveloper) {
            if (ticket.eta) {
                // Convert to proper format
                const etaDate = new Date(ticket.eta);
                const formattedDate = etaDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
                document.getElementById("tinf_eta").value = formattedDate;
            }

            document.getElementById("tinf_estimated_hours").value = ticket.estimated_hours || "";
            document.getElementById("tinf_actual_hours").value = ticket.actual_hours || "";
        }
        if (isUser) {
            document.getElementById("tinf_eta").closest(".tfd").style.display = "none";
            document.getElementById("tinf_estimated_hours").closest(".tfd").style.display = "none";
            document.getElementById("tinf_actual_hours").closest(".tfd").style.display = "none";
        }
        const isUserConsole = window.ViewBag && window.ViewBag.wc === "uc";

        const isResolved = ticket.status && ticket.status.toLowerCase() === "Resolved";


        const resetReadOnlyFields = () => {
            document.getElementById("ticket-title").disabled = false;
            document.getElementById("ticket-description").removeAttribute("readonly");
            document.getElementById("tinf_status").disabled = false;
            document.getElementById("tinf_comments").removeAttribute("readonly");
            document.getElementById("tinf_priority").disabled = false;

            document.getElementById("tinf_feature").disabled = false;
            document.getElementById("tinf_bug").disabled = false;

            document.getElementById("tinf_raising_self").disabled = false;
            document.getElementById("tinf_raising_yes").disabled = false;
            $("#tinf_names").prop("disabled", false);

            document.getElementById("tinf_eta") && (document.getElementById("tinf_eta").disabled = false);
            document.getElementById("tinf_estimated_hours") && (document.getElementById("tinf_estimated_hours").disabled = false);
            document.getElementById("tinf_actual_hours") && (document.getElementById("tinf_actual_hours").disabled = false);

            document.getElementById("capture-screenshot").style.display = "inline-block";
            document.getElementById("upload-image-button").style.display = "inline-block";
            document.getElementById("other-attachments-button").style.display = "inline-block";

            document.getElementById("update-ticket-button").style.display = "inline-block";

            const header = document.getElementById("ticket-id-header");
            header.innerHTML = `Ticket ID: ${ticket.ticketid || 'N/A'}`;
        };

        const makeFormReadOnly = () => {
            document.getElementById("ticket-title").disabled = true;
            document.getElementById("ticket-description").setAttribute("readonly", true);
            document.getElementById("tinf_status").disabled = true;
            document.getElementById("tinf_comments").setAttribute("readonly", true);
            document.getElementById("tinf_priority").disabled = true;

            document.getElementById("tinf_feature").disabled = true;
            document.getElementById("tinf_bug").disabled = true;

            document.getElementById("tinf_raising_self").disabled = true;
            document.getElementById("tinf_raising_yes").disabled = true;
            $("#tinf_names").prop("disabled", true);

            document.getElementById("tinf_eta") && (document.getElementById("tinf_eta").disabled = true);
            document.getElementById("tinf_estimated_hours") && (document.getElementById("tinf_estimated_hours").disabled = true);
            document.getElementById("tinf_actual_hours") && (document.getElementById("tinf_actual_hours").disabled = true);

            document.getElementById("capture-screenshot").style.display = "none";
            document.getElementById("upload-image-button").style.display = "none";
            document.getElementById("other-attachments-button").style.display = "none";

            document.getElementById("update-ticket-button").style.display = "none";
        };

        resetReadOnlyFields();

        // Make form read-only and hide update button if it's from User Console
        if (isUserConsole || isResolved) {
            makeFormReadOnly();
        }


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
                    // Handle images
                    const imgElement = document.createElement('img');
                    imgElement.src = `data:${file.contentType};base64,${file.filecollection}`;
                    imgElement.style = 'width: 100px; height: 100px; object-fit: cover; margin: 5px; cursor: pointer;';
                    imgElement.onclick = function () {
                        // Clear previous content before adding new image
                        popupContent.innerHTML = '';
                        popupContent.appendChild(closeButton);

                        // Create an image element for the popup
                        const popupImage = document.createElement('img');
                        popupImage.src = imgElement.src;
                        popupImage.style.maxWidth = '90%';  // Ensures the image is not too wide
                        popupImage.style.maxHeight = '80vh'; // Limits height to prevent overflow
                        popupImage.style.objectFit = 'contain'; // Keeps the aspect ratio

                        // Append image to the popup and show it
                        popupContent.appendChild(popupImage);
                        popup.style.display = 'flex';
                    };


                    if (file.fileName.startsWith('screenshot_')) {
                        document.getElementById('screenshot-container').appendChild(imgElement);
                    } else {
                        document.getElementById('image-thumbnails').appendChild(imgElement);
                    }
                } else if (file.contentType === 'application/pdf') {
                    // Handle PDFs
                    const fileLink = document.createElement('a');
                    fileLink.href = `data:${file.contentType};base64,${file.filecollection}`;
                    fileLink.download = file.fileName;
                    fileLink.textContent = file.fileName;
                    fileLink.style = 'text-decoration: none; color: #007BFF; cursor: pointer; display: block;';

                   fileLink.onclick = function (e) {
    e.preventDefault();

    // Clear existing popup content (except close button)
    while (popupContent.firstChild) {
        popupContent.removeChild(popupContent.firstChild);
    }
    popupContent.appendChild(closeButton); // Ensure close button is always first

    // Create an iframe to display the PDF
    const displayPdf = document.createElement('iframe');
    displayPdf.src = fileLink.href;
    displayPdf.style.width = '100%';
    displayPdf.style.height = '500px';
    displayPdf.style.border = 'none';

    popupContent.appendChild(displayPdf);
    popup.style.display = 'flex';
};


                    document.getElementById('other-attachments-list').appendChild(fileLink);
                }
            });
        }

        document.querySelector('a[href="#comments-tab"]').addEventListener('click', function () {
            const ticketId = document.getElementById('ticket-id-header').textContent.replace('Ticket ID: ', '').trim();
            if (ticketId) {
                getTicketComments(ticketId);
                document.getElementById("new-comment-indicator").style.display = "none";

            }
        });

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
        const isUserConsole = window.ViewBag && window.ViewBag.wc === "uc";

        if (isUserConsole) {
            document.getElementById("tinf_eta").closest(".tfd").style.display = "none";
            document.getElementById("tinf_estimated_hours").closest(".tfd").style.display = "none";
            document.getElementById("tinf_actual_hours").closest(".tfd").style.display = "none";
        }
        // Default to "No, Self"
        document.getElementById("tinf_raising_self").checked = true;
        document.getElementById("tinf_raising_yes").checked = false;

        // Hide the dropdown for selecting a name
        document.getElementById("tinf_names").style.display = "none";

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

        document.getElementById("ticket-title").disabled = false;
        document.getElementById("ticket-description").removeAttribute("readonly");
        document.getElementById("tinf_priority").disabled = false;

        document.getElementById("tinf_feature").disabled = false;
        document.getElementById("tinf_bug").disabled = false;

        document.getElementById("tinf_raising_self").disabled = false;
        document.getElementById("tinf_raising_yes").disabled = false;
        $("#tinf_names").prop("disabled", false);

        document.getElementById("capture-screenshot").style.display = "block";
        document.getElementById("upload-image-button").style.display = "block";
        document.getElementById("other-attachments-button").style.display = "inline-block";


       

        // Clear attachments
        document.getElementById("screenshot-container").innerHTML = ""; // Clear screenshot thumbnails
        document.getElementById("image-thumbnails").innerHTML = ""; // Clear image thumbnails
        document.getElementById("other-attachments-list").innerHTML = ""; // Clear other attachments

        fetchUsers()

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
    document.getElementById('update-ticket-button').addEventListener('click', async function (event) {
        event.preventDefault();

        try {
            // Collect the ticket ID
            const ticketIdHeader = document.getElementById("ticket-id-header");
            if (!ticketIdHeader) {
                alert("Error: Ticket ID not found.");
                return;
            }

            const ticketId = ticketIdHeader.textContent.split(":")[1]?.trim();
            if (!ticketId) {
                alert("Error: Invalid ticket ID.");
                return;
            }

            // Get the form field values
            const titleField = document.getElementById("ticket-title");
            const descriptionField = document.getElementById("ticket-description");
            const statusField = document.getElementById("tinf_status");
            const priorityField = document.getElementById("tinf_priority");
            const typeField = document.querySelector('input[name=tinf_type]:checked');
            const soluElement = document.getElementById("soluid");
            const etaField = document.getElementById("tinf_eta");
            const estimatedHoursField = document.getElementById("tinf_estimated_hours");
            const actualHoursField = document.getElementById("tinf_actual_hours");
            const commentsField = document.getElementById("tinf_comments");
            let hasErrors = false;

            // Clear previous error messages
            document.getElementById("title-error").textContent = "";
            document.getElementById("description-error").textContent = "";

            // Validate required fields
            if (!titleField || titleField.value.trim() === "") {
                document.getElementById("title-error").textContent = "Title is required.";
                titleField.style.borderColor = "red";
                hasErrors = true;
            } else {
                titleField.style.borderColor = "";
            }

            if (!descriptionField || descriptionField.value.trim() === "") {
                document.getElementById("description-error").textContent = "Description is required.";
                descriptionField.style.borderColor = "red";
                hasErrors = true;
            } else {
                descriptionField.style.borderColor = "";
            }

            if (!statusField || !priorityField || !typeField) {
                alert("Error: Some required fields are missing.");
                return;
            }

            // Stop submission if there are errors
            if (hasErrors) {
                return;
            }

            // Prepare the form data
            let data = new FormData();
            data.append("ticketId", ticketId);
            data.append("solu_id", soluElement ? soluElement.getAttribute('sol_id') : "");

            let changedTkt = {
                title: titleField.value.trim(),
                description: descriptionField.value.trim(),
                status: statusField.value.trim(),
                priority: priorityField.value.trim(),
                type_f_b: typeField.value.trim(),
                eta: etaField?.value.trim() || "",
                estimated_hours: estimatedHoursField?.value.trim() || "",
                actual_hours: actualHoursField?.value.trim() || "",
                comments: commentsField?.value.trim() || ""
            };


            data.append("updtkt", JSON.stringify(changedTkt));

            // Attach screenshots (if any)
            document.querySelectorAll('#screenshot-container img').forEach((screenshot, index) => {
                const blob = dataURLToBlob(screenshot.src);
                data.append(`screenshot_${index}`, blob, `screenshot_${index}.png`);
            });

            // Attach uploaded images (if any)
            document.querySelectorAll('#image-thumbnails img').forEach((image, index) => {
                const blob = dataURLToBlob(image.src);
                data.append(`imageUpload_${index}`, blob, `image_${index}.png`);
            });

            // Attach other files (if any)
            if (selectedAttachments.length > 0) {
                selectedAttachments.forEach((file, index) => {
                    console.log(`Appending file: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);
                    data.append(`files[${index}]`, file);
                });
            } else {
                console.warn("No non-image files selected during update!");
            }

            // Debugging: Log FormData entries to confirm files are included
            for (let pair of data.entries()) {
                console.log(pair[0], pair[1]);
            }

            // Show loader
            $("#eb_common_loader").EbLoader("show");

            // Send the request to update the ticket
            const response = await fetch(`/SupportTicket/UpdateTicket`, {
                method: 'POST',
                body: data
            });

            $("#eb_common_loader").EbLoader("hide");

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            console.log("Ticket update response:", result);

            if (result.successMessage) {
                showConfirmationMessage();
            } else {
                alert("Failed to update ticket.");
            }
        } catch (error) {
            console.error('Error:', error);
            $("#eb_common_loader").EbLoader("hide");
            alert("Failed to update ticket.");
        }
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
   

    document.addEventListener("DOMContentLoaded", function () {
        
        raisingYes.addEventListener("change", function () {
            namesDropdown.style.display = "block"; // Show the dropdown
        });

        raisingNo.addEventListener("change", function () {
            namesDropdown.style.display = "none"; // Hide the dropdown
            namesDropdown.value = ""; // Reset the selected value
        });

    }); 




    submitTicketButton.addEventListener('click', function (event) {
    event.preventDefault();

    const title = document.getElementById("ticket-title").value.trim();
    const description = document.getElementById("ticket-description").value.trim();
    const statusInput = document.getElementById("tinf_status");
    statusInput.value = "New";
    const status = statusInput.value;
    const onBehalfOf = raisingYes.checked ? namesDropdown.value.trim() : ""; 


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
        return;
    }

    let data = new FormData();
    data.append("title", title);
    data.append("description", description);
    data.append("status", status);
    data.append("priority", document.getElementById("tinf_priority").value.trim());
    data.append("type_f_b", document.querySelector('input[name=tinf_type]:checked').value.trim());
    data.append("solid", document.getElementById("soluid").getAttribute('sol_id'));
   data.append("onBehalfOf", onBehalfOf); // Add "on behalf of" field

    // Attach screenshots (if any)
    const screenshotContainer = document.getElementById('screenshot-container').querySelectorAll('img');
    screenshotContainer.forEach((screenshot, index) => {
        const blob = dataURLToBlob(screenshot.src);
        data.append(`screenshot_${index}`, blob, `screenshot_${index}.png`);
    });

        // Attach uploaded images (if any)
        document.querySelectorAll('#image-thumbnails img').forEach((image, index) => {
            const blob = dataURLToBlob(image.src);
            data.append(`imageUpload_${index}`, blob, `image_${index}.png`);
        });

        if (selectedAttachments.length > 0) {
            selectedAttachments.forEach((file, index) => {
                console.log(`Appending file: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);
                data.append(`files[${index}]`, file); // Append non-image attachments properly
            });
        } else {
            console.warn("No non-image files selected!");
        }

        sendData(data);


    
    function sendData(data) {
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
              console.log("Ticket submitted successfully:", data);

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
    }
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


    window.addEventListener("DOMContentLoaded", function () {
        const isDeveloper = window.ViewBag && window.ViewBag.wc === "dc";

        const statusInput = document.getElementById("tinf_status");
        const commentsTextarea = document.getElementById("tinf_comments");
        const estimatedHoursInput = document.getElementById("tinf_estimated_hours");
        const etaInput = document.getElementById("tinf_eta");
        const actualHoursInput = document.getElementById("tinf_actual_hours");

        if (!isDeveloper) {
            statusInput.disabled = true;
            commentsTextarea.readOnly = true;
            estimatedHoursInput.readOnly = true;
            etaInput.readOnly = true;
            actualHoursInput.readOnly = true;

        }

        // Optional: Hide create buttons if not a developer
        const createTicketButton = document.getElementById("create-ticket-button");
        const createTicketButtonClosed = document.getElementById("create-ticket-button-closed");

        if (isDeveloper) {
            if (createTicketButton) createTicketButton.style.display = "none";
            if (createTicketButtonClosed) createTicketButtonClosed.style.display = "none";
        }
    });
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

            // Prevent duplicate file selection
            if (selectedAttachments.some(att => att.name === file.name)) {
                alert(`File "${file.name}" is already selected.`);
                continue; // Skip duplicate
            }

            selectedAttachments.push(file); // Store file reference
            appendAttachment(URL.createObjectURL(file), otherAttachmentsList, 'attachment', file.name);
        }
        otherAttachmentsInput.value = ''; // Clear input to allow re-selection
    });


});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('send-comment-btn').addEventListener('click', function (event) {
        event.preventDefault();

        const commentInput = document.getElementById('ticket-comments');
        const commentText = commentInput.value.trim();

        const ticketId = document.getElementById('ticket-id-header')?.textContent.replace('Ticket ID: ', '').trim();
        const username = document.getElementById('current-username')?.value;
        const solutionId = document.getElementById('soluid')?.textContent.trim(); // soluid is a <span>, not an input
        const currentUserid = document.getElementById('Uid')?.textContent.trim() || "";
        console.log(currentUserid)

        console.log('Sending data to backend:', {
            TicketNo: ticketId,
            Comments: commentText,
            UserName: username,
            Solution_id: solutionId
        });

        if (commentText) {
            // ✅ Log data before sending
            console.log('Sending data to backend:', {
                TicketNo: ticketId,
                Comments: commentText,
                UserName: username,
                Solution_id: solutionId
            });

            $.ajax({
                url: '../SupportTicket/Comment',
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                data: {
                    TicketNo: ticketId,
                    Comments: commentText,
                    UserName: username,
                    Solution_id: solutionId,
                    currentUserid: currentUserid
},
                success: function (response) {
                    if (response.CmntStatus === false && response.ErMsg) {
                        alert(response.ErMsg);
                        return;
                    }

                    const timestamp = new Date().toLocaleString();

                    const commentBox = document.createElement('div');
                    commentBox.className = 'trcmnt_comment-box';

                    const commentContent = `
                        <small class="trcmnt_username">${username}</small>
                        <small class="trcmnt_timestamp">${timestamp}</small>
                        <p class="trcmnt_para">${commentText}</p>
                    `;

                    commentBox.innerHTML = commentContent;
                    document.getElementById('comments-display').appendChild(commentBox);

                    setTimeout(() => {
                        const commentsDisplay = document.getElementById('comments-display');
                        commentsDisplay.scrollTo({ top: commentsDisplay.scrollHeight, behavior: 'smooth' });
                    }, 100);


                    commentInput.value = '';

                    lastCommentCount += 1;

                },
                error: function () {
                    alert('Failed to send comment. Please try again.');
                }
            });
        } else {
            alert('Comment field cannot be empty.');
        }
    });
});






