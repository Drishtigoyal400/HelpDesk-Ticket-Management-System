
const STORAGE_KEY = "helpDeskTickets";

let tickets = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function saveTickets() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("ticketForm");

    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = document.getElementById("ticketTitle").value.trim();
        const customer = document.getElementById("studentName").value.trim();
        const category = document.getElementById("category").value;
        const priority = document.getElementById("priority").value;
        const description = document.getElementById("description").value.trim();

        if (!title || !customer || !category || !priority || !description) {
            alert("Please fill in all required fields.");
            return;
        }

        const ticket = {
            id: "TKT-" + Date.now(),
            title: title,
            customer: customer,
            category: category,
            priority: priority,
            description: description,
            agent: "Unassigned",
            status: "Open",
            comments: [],
            history: [{
                action: "Ticket created",
                date: new Date().toLocaleString()
            }],
            createdAt: new Date().toISOString()
        };

        tickets.unshift(ticket);
        saveTickets();

        alert("Ticket submitted successfully!");

        window.location.href = "all-tickets.html";
    });
});


function displayAllTickets() {
    const tableBody = document.getElementById("ticketsTableBody");
    if (!tableBody) return;

    const tickets = JSON.parse(
        localStorage.getItem("helpDeskTickets") || "[]"
    );

    const agents = [
        "Unassigned",
        "Alex Morgan",
        "Sarah Chen",
        "James Wilson",
        "Priya Sharma"
    ];

    if (tickets.length === 0) {
        tableBody.innerHTML =
            '<tr><td colspan="8">No tickets yet. Raise a new ticket!</td></tr>';
        return;
    }

    tableBody.innerHTML = tickets.map(ticket => {
        const priorityClass = {
            Low: "badge-low",
            Medium: "badge-medium",
            High: "badge-high",
            Urgent: "badge-high"
        }[ticket.priority] || "badge-medium";

        const statusClass = {
            Open: "badge-open",
            "In Progress": "badge-progress",
            Resolved: "badge-closed",
            Closed: "badge-closed"
        }[ticket.status] || "badge-open";

        const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;",
            '"': "&quot;", "'": "&#39;"
        })[c]);

        return `
            <tr>
                <td>${escape(ticket.id)}</td>
                <td>${escape(ticket.title)}</td>
                <td>${escape(ticket.customer)}</td>
                <td>${escape(ticket.category)}</td>
                <td><span class="badge ${priorityClass}">${escape(ticket.priority)}</span></td>
                <td>
                    <select onchange="updateTicketStatus('${escape(ticket.id)}', this.value)">
                        ${["Open", "In Progress", "Resolved", "Closed"].map(status =>
            `<option value="${status}" ${ticket.status === status ? "selected" : ""}>${status}</option>`
        ).join("")}
                    </select>
                </td>
                <td>
                    <select onchange="assignTicketAgent('${escape(ticket.id)}', this.value)">
                        ${agents.map(agent =>
            `<option value="${agent}" ${(ticket.agent || "Unassigned") === agent ? "selected" : ""}>${agent}</option>`
        ).join("")}
                    </select>
                </td>
                <td>
                    <button type="button" onclick="showTicketDetails('${escape(ticket.id)}')">
                        View Details
                    </button>
                </td>
            </tr>`;
    }).join("");
}


function escapeTicketHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

document.addEventListener("DOMContentLoaded", displayAllTickets);

function updateDashboardCounts() {
    const tickets = JSON.parse(
        localStorage.getItem("helpDeskTickets") || "[]"
    );

    document.getElementById("totalTickets").textContent = tickets.length;

    document.getElementById("openTickets").textContent =
        tickets.filter(t => t.status === "Open").length;

    document.getElementById("inProgressTickets").textContent =
        tickets.filter(t => t.status === "In Progress").length;

    document.getElementById("resolvedTickets").textContent =
        tickets.filter(t => t.status === "Resolved").length;
}

document.addEventListener("DOMContentLoaded", updateDashboardCounts);

function updateTicketStatus(ticketId, newStatus) {
    const tickets = JSON.parse(
        localStorage.getItem("helpDeskTickets") || "[]"
    );

    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    if (ticket.status !== newStatus) {
        ticket.status = newStatus;
        ticket.history = ticket.history || [];

        ticket.history.push({
            action: "Status changed to " + newStatus,
            date: new Date().toLocaleString()
        });

        localStorage.setItem("helpDeskTickets", JSON.stringify(tickets));
        displayAllTickets();
    }
}

function assignTicketAgent(ticketId, agentName) {
    const tickets = JSON.parse(
        localStorage.getItem("helpDeskTickets") || "[]"
    );

    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    if (ticket.agent !== agentName) {
        ticket.agent = agentName;
        ticket.history = ticket.history || [];

        ticket.history.push({
            action: "Assigned to " + agentName,
            date: new Date().toLocaleString()
        });

        localStorage.setItem("helpDeskTickets", JSON.stringify(tickets));
        displayAllTickets();
    }
}

function showTicketDetails(ticketId) {
    let tickets = JSON.parse(
        localStorage.getItem("helpDeskTickets") || "[]"
    );

    let ticket = tickets.find(function (item) {
        return String(item.id) === String(ticketId);
    });

    if (!ticket) {
        alert("Ticket not found!");
        return;
    }

    let commentsText = (ticket.comments || [])
        .map(function (comment) {
            return typeof comment === "string"
                ? comment
                : comment.text;
        })
        .join("\n");

    let historyText = (ticket.history || [])
        .map(function (item) {
            return item.date + " - " + item.action;
        })
        .join("\n");

    let details =
        "TICKET DETAILS\n\n" +
        "ID: " + ticket.id + "\n" +
        "Title: " + ticket.title + "\n" +
        "Customer: " + ticket.customer + "\n" +
        "Category: " + ticket.category + "\n" +
        "Priority: " + ticket.priority + "\n" +
        "Status: " + ticket.status + "\n" +
        "Assigned Agent: " + (ticket.agent || "Unassigned") + "\n\n" +
        "Description:\n" + ticket.description + "\n\n" +
        "Comments:\n" + (commentsText || "No comments yet") + "\n\n" +
        "History:\n" + (historyText || "No history yet");

    alert(details);

    let newComment = prompt("Enter your comment:");

    if (newComment === null || newComment.trim() === "") {
        return;
    }

    ticket.comments = ticket.comments || [];
    ticket.history = ticket.history || [];

    ticket.comments.push({
        text: newComment.trim(),
        date: new Date().toLocaleString()
    });

    ticket.history.push({
        action: "Comment added: " + newComment.trim(),
        date: new Date().toLocaleString()
    });

    localStorage.setItem("helpDeskTickets", JSON.stringify(tickets));

    alert("Comment saved successfully!");
}
