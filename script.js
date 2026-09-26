// ============================================================
// POGA KSA MEMBER MANAGEMENT SYSTEM
// COMPLETE SCRIPT.JS
// ============================================================


// ============================================================
// SUPABASE CONFIGURATION
// ============================================================

const SUPABASE_URL =
  "https://rocvqcqgbdohfwfkhncy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_wStACVHPYgU82oxbsvAWTg_EdkHrQaF";

const PHOTO_BUCKET =
  "member-photos";


// ============================================================
// CREATE SUPABASE CLIENT
// ============================================================

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ============================================================
// GET HTML ELEMENTS
// ============================================================

const memberForm =
  document.getElementById("memberForm");

const memberId =
  document.getElementById("memberId");

const fullName =
  document.getElementById("fullName");

const passportNumber =
  document.getElementById("passportNumber");

const birthday =
  document.getElementById("birthday");

const address =
  document.getElementById("address");

const contact =
  document.getElementById("contact");

const emergencyContact =
  document.getElementById("emergencyContact");

const emergencyNumber =
  document.getElementById("emergencyNumber");

const status =
  document.getElementById("status");

const photo =
  document.getElementById("photo");

const photoPreview =
  document.getElementById("photoPreview");

const memberTable =
  document.getElementById("memberTable");

const search =
  document.getElementById("search");

const saveButton =
  document.getElementById("saveButton");

const cancelButton =
  document.getElementById("cancelButton");

const formTitle =
  document.getElementById("formTitle");

const emptyMessage =
  document.getElementById("emptyMessage");


// ============================================================
// CHECK REQUIRED HTML ELEMENTS
// ============================================================

if (!memberForm) {
  console.error("ERROR: memberForm not found.");
}

if (!memberTable) {
  console.error("ERROR: memberTable not found.");
}

if (!saveButton) {
  console.error("ERROR: saveButton not found.");
}


// ============================================================
// VARIABLES
// ============================================================

let editingId = null;

let currentPhotoUrl = null;

let selectedPhotoFile = null;


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    console.log(
      "POGA KSA Member System started."
    );

    loadMembers();

  }
);


// ============================================================
// PHOTO FILE CHANGE
// ============================================================

if (photo) {

  photo.addEventListener(
    "change",
    function () {

      const file =
        photo.files &&
        photo.files[0];

      selectedPhotoFile =
        file || null;


      if (!file) {

        if (currentPhotoUrl) {

          showPhotoPreview(
            currentPhotoUrl
          );

        } else {

          photoPreview.innerHTML =
            "";

        }

        return;

      }


      // Check image type

      if (
        !file.type ||
        !file.type.startsWith("image/")
      ) {

        alert(
          "Please select an image file only."
        );

        photo.value = "";

        selectedPhotoFile =
          null;

        return;

      }


      // Maximum 5 MB

      const maxSize =
        5 * 1024 * 1024;


      if (file.size > maxSize) {

        alert(
          "Photo is too large.\n\n" +
          "Maximum allowed size is 5 MB."
        );

        photo.value = "";

        selectedPhotoFile =
          null;

        return;

      }


      // Preview selected photo

      const reader =
        new FileReader();


      reader.onload =
        function (event) {

          photoPreview.innerHTML = `

            <img
              src="${event.target.result}"
              class="preview-image"
              alt="Photo Preview"
            >

          `;

        };


      reader.onerror =
        function () {

          alert(
            "Unable to preview this photo."
          );

        };


      reader.readAsDataURL(file);

    }
  );

}


// ============================================================
// FORM SUBMIT
// ============================================================

if (memberForm) {

  memberForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      console.log(
        "FORM SUBMITTED"
      );


      if (editingId === null) {

        await addMember();

      } else {

        await updateMember();

      }

    }
  );

}


// ============================================================
// CANCEL BUTTON
// ============================================================

if (cancelButton) {

  cancelButton.addEventListener(
    "click",
    function () {

      resetForm();

    }
  );

}


// ============================================================
// SEARCH
// ============================================================

if (search) {

  search.addEventListener(
    "input",
    async function () {

      const query =
        search.value
          .trim()
          .toLowerCase();


      if (!query) {

        await loadMembers();

        return;

      }


      await searchMembers(query);

    }
  );

}


// ============================================================
// GET FORM DATA
// ============================================================

function getFormData() {

  return {

    member_id:
      memberId
        ? memberId.value.trim()
        : "",

    full_name:
      fullName
        ? fullName.value.trim()
        : "",

    passport_number:
      passportNumber
        ? passportNumber.value.trim()
        : "",

    birthday:
      birthday && birthday.value
        ? birthday.value
        : null,

    address:
      address
        ? address.value.trim()
        : "",

    contact_number:
      contact
        ? contact.value.trim()
        : "",

    emergency_contact_person:
      emergencyContact
        ? emergencyContact.value.trim()
        : "",

    emergency_contact_number:
      emergencyNumber
        ? emergencyNumber.value.trim()
        : "",

    membership_status:
      status && status.value
        ? status.value
        : "Active"

  };

}


// ============================================================
// ADD MEMBER
// ============================================================

async function addMember() {

  const member =
    getFormData();


  // Validation

  if (
    !member.member_id ||
    !member.full_name
  ) {

    alert(
      "Please enter Member ID and Full Name."
    );

    return;

  }


  setSavingState(
    true,
    "Saving..."
  );


  try {

    console.log(
      "Adding member:",
      member
    );


    // --------------------------------------------------------
    // UPLOAD PHOTO FIRST
    // --------------------------------------------------------

    let photoUrl = null;


    if (selectedPhotoFile) {

      console.log(
        "Uploading photo..."
      );


      photoUrl =
        await uploadPhoto(
          selectedPhotoFile
        );


      console.log(
        "Photo URL:",
        photoUrl
      );

    }


    member.photo_url =
      photoUrl;


    // --------------------------------------------------------
    // INSERT MEMBER INTO SUPABASE
    // --------------------------------------------------------

    const {
      data,
      error
    } =
      await supabaseClient

        .from("members")

        .insert([member])

        .select()
        .single();


    if (error) {

      console.error(
        "SUPABASE INSERT ERROR:",
        error
      );


      showSupabaseError(
        "SAVE MEMBER FAILED",
        error
      );

      return;

    }


    console.log(
      "MEMBER SAVED:",
      data
    );


    alert(
      "Member registered successfully!"
    );


    resetForm();

    await loadMembers();

  }

  catch (error) {

    console.error(
      "ADD MEMBER ERROR:",
      error
    );


    alert(
      "SAVE ERROR\n\n" +
      getErrorMessage(error)
    );

  }

  finally {

    setSavingState(
      false,
      "Add Member"
    );

  }

}


// ============================================================
// UPDATE MEMBER
// ============================================================

async function updateMember() {

  if (editingId === null) {

    alert(
      "No member is currently being edited."
    );

    return;

  }


  const member =
    getFormData();


  if (
    !member.member_id ||
    !member.full_name
  ) {

    alert(
      "Please enter Member ID and Full Name."
    );

    return;

  }


  setSavingState(
    true,
    "Updating..."
  );


  try {

    console.log(
      "Updating member ID:",
      editingId
    );


    // Keep old photo if no new photo selected

    let photoUrl =
      currentPhotoUrl;


    // Upload new photo if selected

    if (selectedPhotoFile) {

      photoUrl =
        await uploadPhoto(
          selectedPhotoFile
        );

    }


    member.photo_url =
      photoUrl;


    const {
      data,
      error
    } =
      await supabaseClient

        .from("members")

        .update(member)

        .eq(
          "id",
          editingId
        )

        .select()
        .single();


    if (error) {

      console.error(
        "SUPABASE UPDATE ERROR:",
        error
      );


      showSupabaseError(
        "UPDATE MEMBER FAILED",
        error
      );

      return;

    }


    console.log(
      "MEMBER UPDATED:",
      data
    );


    alert(
      "Member updated successfully!"
    );


    resetForm();

    await loadMembers();

  }

  catch (error) {

    console.error(
      "UPDATE ERROR:",
      error
    );


    alert(
      "UPDATE ERROR\n\n" +
      getErrorMessage(error)
    );

  }

  finally {

    setSavingState(
      false,
      "Add Member"
    );

  }

}


// ============================================================
// UPLOAD PHOTO TO SUPABASE STORAGE
// ============================================================

async function uploadPhoto(file) {

  if (!file) {

    return null;

  }


  // Check bucket name

  console.log(
    "Uploading to bucket:",
    PHOTO_BUCKET
  );


  // Get extension

  const extension =
    getFileExtension(
      file.name
    );


  // Create unique filename

  const fileName =
    "member_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .substring(2, 10) +
    extension;


  console.log(
    "Photo filename:",
    fileName
  );


  // ----------------------------------------------------------
  // UPLOAD
  // ----------------------------------------------------------

  const {
    data,
    error
  } =
    await supabaseClient

      .storage

      .from(PHOTO_BUCKET)

      .upload(
        fileName,
        file,
        {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type
        }
      );


  if (error) {

    console.error(
      "PHOTO UPLOAD ERROR:",
      error
    );


    throw new Error(

      "PHOTO UPLOAD FAILED\n\n" +

      "Message: " +
      (error.message || "Unknown error") +

      "\n\nStatus: " +
      (error.statusCode || "N/A") +

      "\n\nBucket: " +
      PHOTO_BUCKET

    );

  }


  console.log(
    "PHOTO UPLOAD SUCCESS:",
    data
  );


  // ----------------------------------------------------------
  // GET PUBLIC URL
  // ----------------------------------------------------------

  const {
    data: publicData
  } =
    supabaseClient

      .storage

      .from(PHOTO_BUCKET)

      .getPublicUrl(
        fileName
      );


  if (
    !publicData ||
    !publicData.publicUrl
  ) {

    throw new Error(
      "Photo uploaded, but Supabase did not return a public URL."
    );

  }


  console.log(
    "PUBLIC PHOTO URL:",
    publicData.publicUrl
  );


  return publicData.publicUrl;

}


// ============================================================
// FILE EXTENSION
// ============================================================

function getFileExtension(
  filename
) {

  if (!filename) {

    return ".jpg";

  }


  const dot =
    filename.lastIndexOf(".");


  if (dot === -1) {

    return ".jpg";

  }


  return filename
    .substring(dot)
    .toLowerCase();

}


// ============================================================
// LOAD ALL MEMBERS
// ============================================================

async function loadMembers() {

  if (!memberTable) {

    console.error(
      "memberTable not found."
    );

    return;

  }


  memberTable.innerHTML =
    "";


  if (emptyMessage) {

    emptyMessage.textContent =
      "Loading members...";

    emptyMessage.style.display =
      "block";

  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient

        .from("members")

        .select("*")

        .order(
          "id",
          {
            ascending: false
          }
        );


    if (error) {

      console.error(
        "LOAD ERROR:",
        error
      );


      showSupabaseError(
        "LOAD MEMBERS FAILED",
        error
      );

      return;

    }


    console.log(
      "MEMBERS LOADED:",
      data
    );


    if (
      !data ||
      data.length === 0
    ) {

      if (emptyMessage) {

        emptyMessage.textContent =
          "No member records found.";

        emptyMessage.style.display =
          "block";

      }

      return;

    }


    if (emptyMessage) {

      emptyMessage.style.display =
        "none";

    }


    displayMembers(data);

  }

  catch (error) {

    console.error(
      "LOAD MEMBERS ERROR:",
      error
    );


    alert(
      "LOAD MEMBERS ERROR\n\n" +
      getErrorMessage(error)
    );

  }

}


// ============================================================
// DISPLAY MEMBERS
// ============================================================

function displayMembers(data) {

  if (!memberTable) {

    return;

  }


  memberTable.innerHTML =
    "";


  data.forEach(
    function (member) {

      const row =
        document.createElement("tr");


      const statusClass =
        member.membership_status ===
        "Active"

          ? "status-active"

          : "status-inactive";


      // ------------------------------------------------------
      // PHOTO
      // ------------------------------------------------------

      let photoHTML;


      if (member.photo_url) {

        photoHTML = `

          <img
            src="${escapeHTML(
              member.photo_url
            )}"
            class="member-photo"
            alt="Member Photo"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          >

          <div
            class="no-photo"
            style="display:none;"
          >
            Photo unavailable
          </div>

        `;

      } else {

        photoHTML = `

          <div class="no-photo">
            No Photo
          </div>

        `;

      }


      // ------------------------------------------------------
      // TABLE ROW
      // ------------------------------------------------------

      row.innerHTML = `

        <td>
          ${photoHTML}
        </td>

        <td>
          ${escapeHTML(
            member.member_id || ""
          )}
        </td>

        <td>
          ${escapeHTML(
            member.full_name || ""
          )}
        </td>

        <td>
          ${escapeHTML(
            member.passport_number || ""
          )}
        </td>

        <td>
          ${escapeHTML(
            member.birthday || ""
          )}
        </td>

        <td>
          ${escapeHTML(
            member.contact_number || ""
          )}
        </td>

        <td class="${statusClass}">
          ${escapeHTML(
            member.membership_status || ""
          )}
        </td>

        <td>

          <button
            type="button"
            class="btn-view"
            data-action="view"
            data-id="${member.id}"
          >
            View
          </button>

          <button
            type="button"
            class="btn-edit"
            data-action="edit"
            data-id="${member.id}"
          >
            Edit
          </button>

          <button
            type="button"
            class="btn-delete"
            data-action="delete"
            data-id="${member.id}"
            data-name="${escapeHTML(
              member.full_name || ""
            )}"
          >
            Delete
          </button>

        </td>

      `;


      memberTable.appendChild(row);

    }
  );

}


// ============================================================
// ACTION BUTTONS
// ============================================================

if (memberTable) {

  memberTable.addEventListener(
    "click",
    async function (event) {

      const button =
        event.target.closest(
          "button"
        );


      if (!button) {

        return;

      }


      const action =
        button.dataset.action;


      const id =
        Number(
          button.dataset.id
        );


      if (!id) {

        alert(
          "Invalid member ID."
        );

        return;

      }


      // VIEW

      if (
        action === "view"
      ) {

        await viewMember(id);

        return;

      }


      // EDIT

      if (
        action === "edit"
      ) {

        await editMember(id);

        return;

      }


      // DELETE

      if (
        action === "delete"
      ) {

        await deleteMember(
          id,
          button.dataset.name || ""
        );

        return;

      }

    }
  );

}


// ============================================================
// VIEW MEMBER
// ============================================================

async function viewMember(id) {

  try {

    const {
      data,
      error
    } =
      await supabaseClient

        .from("members")

        .select("*")

        .eq(
          "id",
          id
        )

        .single();


    if (error) {

      showSupabaseError(
        "VIEW MEMBER FAILED",
        error
      );

      return;

    }


    if (!data) {

      alert(
        "Member not found."
      );

      return;

    }


    // Remove existing profile if any

    closeMemberProfile();


    // Photo

    let photoHTML;


    if (data.photo_url) {

      photoHTML = `

        <img
          src="${escapeHTML(
            data.photo_url
          )}"
          class="profile-photo"
          alt="Member Photo"
          onerror="this.style.display='none';"
        >

      `;

    } else {

      photoHTML = `

        <div class="profile-no-photo">
          No Photo
        </div>

      `;

    }


    // Profile overlay

    const profileHTML = `

      <div
        id="memberProfileOverlay"
        class="member-profile-overlay"
      >

        <div
          class="member-profile-card"
        >

          <button
            type="button"
            class="profile-close"
            id="profileCloseButton"
          >
            ×
          </button>


          <div class="profile-header">

            ${photoHTML}

            <h2>
              ${escapeHTML(
                data.full_name || ""
              )}
            </h2>

            <p>
              Member ID:
              ${escapeHTML(
                data.member_id || "-"
              )}
            </p>

          </div>


          <div class="profile-details">

            <div>
              <strong>
                Passport Number
              </strong>

              <span>
                ${escapeHTML(
                  data.passport_number || "-"
                )}
              </span>
            </div>


            <div>
              <strong>
                Birthday
              </strong>

              <span>
                ${escapeHTML(
                  data.birthday || "-"
                )}
              </span>
            </div>


            <div>
              <strong>
                Address
              </strong>

              <span>
                ${escapeHTML(
                  data.address || "-"
                )}
              </span>
            </div>


            <div>
              <strong>
                Contact Number
              </strong>

              <span>
                ${escapeHTML(
                  data.contact_number || "-"
                )}
              </span>
            </div>


            <div>
              <strong>
                Emergency Contact
              </strong>

              <span>
                ${escapeHTML(
                  data.emergency_contact_person || "-"
                )}
              </span>
            </div>


            <div>
              <strong>
                Emergency Number
              </strong>

              <span>
                ${escapeHTML(
                  data.emergency_contact_number || "-"
                )}
              </span>
            </div>


            <div>
              <strong>
                Membership Status
              </strong>

              <span>
                ${escapeHTML(
                  data.membership_status || "-"
                )}
              </span>
            </div>

          </div>


          <div class="profile-actions">

            <button
              type="button"
              class="btn-edit"
              id="profileEditButton"
            >
              Edit
            </button>


            <button
              type="button"
              class="btn-secondary"
              id="profileCloseButton2"
            >
              Close
            </button>

          </div>

        </div>

      </div>

    `;


    document.body.insertAdjacentHTML(
      "beforeend",
      profileHTML
    );


    // Close button

    const closeButton =
      document.getElementById(
        "profileCloseButton"
      );


    if (closeButton) {

      closeButton.addEventListener(
        "click",
        closeMemberProfile
      );

    }


    const closeButton2 =
      document.getElementById(
        "profileCloseButton2"
      );


    if (closeButton2) {

      closeButton2.addEventListener(
        "click",
        closeMemberProfile
      );

    }


    // Edit button

    const profileEditButton =
      document.getElementById(
        "profileEditButton"
      );


    if (profileEditButton) {

      profileEditButton.addEventListener(
        "click",
        async function () {

          closeMemberProfile();

          await editMember(id);

        }
      );

    }

  }

  catch (error) {

    console.error(
      "VIEW ERROR:",
      error
    );


    alert(
      "VIEW ERROR\n\n" +
      getErrorMessage(error)
    );

  }

}


// ============================================================
// CLOSE MEMBER PROFILE
// ============================================================

function closeMemberProfile() {

  const overlay =
    document.getElementById(
      "memberProfileOverlay"
    );


  if (overlay) {

    overlay.remove();

  }

}


// ============================================================
// EDIT MEMBER
// ============================================================

async function editMember(id) {

  try {

    const {
      data,
      error
    } =
      await supabaseClient

        .from("members")

        .select("*")

        .eq(
          "id",
          id
        )

        .single();


    if (error) {

      showSupabaseError(
        "EDIT MEMBER FAILED",
        error
      );

      return;

    }


    if (!data) {

      alert(
        "Member not found."
      );

      return;

    }


    // Fill form

    memberId.value =
      data.member_id || "";

    fullName.value =
      data.full_name || "";

    passportNumber.value =
      data.passport_number || "";

    birthday.value =
      data.birthday || "";

    address.value =
      data.address || "";

    contact.value =
      data.contact_number || "";

    emergencyContact.value =
      data.emergency_contact_person || "";

    emergencyNumber.value =
      data.emergency_contact_number || "";

    status.value =
      data.membership_status ||
      "Active";


    // Photo

    currentPhotoUrl =
      data.photo_url || null;


    selectedPhotoFile =
      null;


    if (photo) {

      photo.value =
        "";

    }


    if (currentPhotoUrl) {

      showPhotoPreview(
        currentPhotoUrl
      );

    } else {

      photoPreview.innerHTML =
        "";

    }


    // Set editing mode

    editingId =
      data.id;


    formTitle.textContent =
      "Edit Member";


    saveButton.textContent =
      "Update Member";


    cancelButton.classList.remove(
      "hidden"
    );


    // Scroll to form

    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });


    console.log(
      "Editing member:",
      data
    );

  }

  catch (error) {

    console.error(
      "EDIT ERROR:",
      error
    );


    alert(
      "EDIT ERROR\n\n" +
      getErrorMessage(error)
    );

  }

}


// ============================================================
// DELETE MEMBER
// ============================================================

async function deleteMember(
  id,
  name
) {

  const confirmed =
    confirm(

      "Are you sure you want to delete this member?\n\n" +

      "Member: " +
      (name || "Unknown")

    );


  if (!confirmed) {

    return;

  }


  try {

    console.log(
      "Deleting member ID:",
      id
    );


    const {
      error
    } =
      await supabaseClient

        .from("members")

        .delete()

        .eq(
          "id",
          id
        );


    if (error) {

      console.error(
        "DELETE ERROR:",
        error
      );


      showSupabaseError(
        "DELETE MEMBER FAILED",
        error
      );

      return;

    }


    alert(
      "Member deleted successfully!"
    );


    await loadMembers();

  }

  catch (error) {

    console.error(
      "DELETE ERROR:",
      error
    );


    alert(
      "DELETE ERROR\n\n" +
      getErrorMessage(error)
    );

  }

}


// ============================================================
// SEARCH MEMBERS
// ============================================================

async function searchMembers(
  query
) {

  try {

    const {
      data,
      error
    } =
      await supabaseClient

        .from("members")

        .select("*")

        .or(

          "member_id.ilike.%" +
          query +
          "%," +

          "full_name.ilike.%" +
          query +
          "%," +

          "passport_number.ilike.%" +
          query +
          "%," +

          "contact_number.ilike.%" +
          query +
          "%"

        )

        .order(
          "id",
          {
            ascending: false
          }
        );


    if (error) {

      console.error(
        "SEARCH ERROR:",
        error
      );


      showSupabaseError(
        "SEARCH FAILED",
        error
      );

      return;

    }


    if (
      !data ||
      data.length === 0
    ) {

      memberTable.innerHTML =
        "";


      emptyMessage.textContent =
        "No matching members found.";


      emptyMessage.style.display =
        "block";


      return;

    }


    emptyMessage.style.display =
      "none";


    displayMembers(data);

  }

  catch (error) {

    console.error(
      "SEARCH ERROR:",
      error
    );


    alert(
      "SEARCH ERROR\n\n" +
      getErrorMessage(error)
    );

  }

}


// ============================================================
// PHOTO PREVIEW
// ============================================================

function showPhotoPreview(
  url
) {

  if (!photoPreview) {

    return;

  }


  if (!url) {

    photoPreview.innerHTML =
      "";

    return;

  }


  photoPreview.innerHTML = `

    <img
      src="${escapeHTML(url)}"
      class="preview-image"
      alt="Member Photo"
      onerror="this.style.display='none';"
    >

  `;

}


// ============================================================
// RESET FORM
// ============================================================

function resetForm() {

  editingId =
    null;


  currentPhotoUrl =
    null;


  selectedPhotoFile =
    null;


  if (memberForm) {

    memberForm.reset();

  }


  if (photo) {

    photo.value =
      "";

  }


  if (photoPreview) {

    photoPreview.innerHTML =
      "";

  }


  if (formTitle) {

    formTitle.textContent =
      "Add Member";

  }


  if (saveButton) {

    saveButton.textContent =
      "Add Member";

    saveButton.disabled =
      false;

  }


  if (cancelButton) {

    cancelButton.classList.add(
      "hidden"
    );

  }

}


// ============================================================
// BUTTON SAVING STATE
// ============================================================

function setSavingState(
  saving,
  text
) {

  if (!saveButton) {

    return;

  }


  saveButton.disabled =
    saving;


  saveButton.textContent =
    text;

}


// ============================================================
// SUPABASE ERROR DISPLAY
// ============================================================

function showSupabaseError(
  title,
  error
) {

  console.error(
    title,
    error
  );


  const message =
    error && error.message
      ? error.message
      : "Unknown error";


  const code =
    error && error.code
      ? error.code
      : "N/A";


  const details =
    error && error.details
      ? error.details
      : "N/A";


  const hint =
    error && error.hint
      ? error.hint
      : "N/A";


  alert(

    title +

    "\n\nMessage:\n" +
    message +

    "\n\nCode:\n" +
    code +

    "\n\nDetails:\n" +
    details +

    "\n\nHint:\n" +
    hint

  );

}


// ============================================================
// GENERAL ERROR MESSAGE
// ============================================================

function getErrorMessage(
  error
) {

  if (!error) {

    return "Unknown error.";

  }


  if (error.message) {

    return error.message;

  }


  return String(error);

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(
  value
) {

  return String(
    value == null
      ? ""
      : value
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


// ============================================================
// END
// ============================================================

console.log(
  "POGA KSA script.js loaded successfully."
);
