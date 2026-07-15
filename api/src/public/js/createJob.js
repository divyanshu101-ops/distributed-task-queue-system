const jobType = document.getElementById("jobType");
const dynamicFields = document.getElementById("dynamicFields");
const jobForm = document.getElementById("jobForm");

jobType.addEventListener("change", (event) => {

    const selectedJob = event.target.value;

    switch (selectedJob) {

        case "email":
            renderEmailFields();
            break;

        case "report":
            renderReportFields();
            break;

        case "notification":
            renderNotificationFields();
            break;

        case "image":
            renderImageFields();
            break;

        case "file":
            renderFileFields();
            break;

        default:
            dynamicFields.innerHTML = "";

    }

});

function renderEmailFields() {

    dynamicFields.innerHTML = `

        <div class="form-group">

            <label for="to">To</label>

            <input
                type="email"
                id="to"
                placeholder="Enter recipient email"
            >

        </div>

        <div class="form-group">

            <label for="subject">Subject</label>

            <input
                type="text"
                id="subject"
                placeholder="Enter subject"
            >

        </div>

        <div class="form-group">

            <label for="message">Message</label>

            <textarea
                id="message"
                rows="5"
                placeholder="Enter email message"
            ></textarea>

        </div>

    `;

}

function renderReportFields() {

    dynamicFields.innerHTML = `

        <div class="form-group">

            <label for="reportName">Report Name</label>

            <input
                type="text"
                id="reportName"
                placeholder="Enter report name"
            >

        </div>

        <div class="form-group">

            <label for="content">Content</label>

            <textarea
                id="content"
                rows="6"
                placeholder="Enter report content"
            ></textarea>

        </div>

    `;

}

function renderNotificationFields() {

    dynamicFields.innerHTML = `

        <div class="form-group">

            <label for="userId">User ID</label>

            <input
                type="number"
                id="userId"
                placeholder="Enter user id"
            >

        </div>

        <div class="form-group">

            <label for="title">Title</label>

            <input
                type="text"
                id="title"
                placeholder="Enter notification title"
            >

        </div>

        <div class="form-group">

            <label for="message">Message</label>

            <textarea
                id="message"
                rows="5"
                placeholder="Enter notification message"
            ></textarea>

        </div>

    `;

}

function renderImageFields() {

    dynamicFields.innerHTML = `

        <div class="form-group">

            <label for="image">Select Image</label>

            <input
                type="file"
                id="image"
                accept="image/*"
            >

        </div>

    `;

}

function renderFileFields() {

    dynamicFields.innerHTML = `

        <div class="form-group">

            <label for="file">Select File</label>

            <input
                type="file"
                id="file"
            >

        </div>

    `;

}



jobForm.addEventListener("submit", (event) => {

    event.preventDefault();

    console.log("Form Submitted");

});