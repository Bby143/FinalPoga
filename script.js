// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
  "https://rocvqcqgbdohfwfkhncy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_wStACVHPYgU82oxbsvAWTg_EdkHrQaF";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ========================================
// SETTINGS
// ========================================

const PHOTO_BUCKET = "member-photos";


// ========================================
// ELEMENTS
// ========================================

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


// ========================================
// VARIABLES
// ========================================

let editingId = null;
let currentPhotoUrl = null;
let selectedPhotoFile = null;


// ========================================
// CHECK ELEMENTS
// ========================================

if (!memberForm) {
  alert("ERROR: memberForm was not found.");
}

if (!saveButton) {
  alert("ERROR: saveButton was not found.");
}


// ========================================
// PHOTO SELECT
// ========================================

if (photo) {

  photo.addEventListener(
    "change",
    function () {

      const file =
        photo.files[0];

      selectedPhotoFile =
        file || null;


      if (!file) {

        if (currentPhotoUrl) {

          showPhotoPreview(
            currentPhotoUrl
          );

        } else {

          photoPreview.innerHTML = "";

        }

        return;
      }


      if (!file.type.startsWith("image/")) {

        alert(
          "Please select an image file."
        );

        photo.value = "";
        selectedPhotoFile = null;

        return;
      }


      const maxSize =
        5 * 1024 * 1024;


      if (file.size > maxSize) {

        alert(
          "Photo is too large.\n\nMaximum size is 5 MB."
        );

        photo.value = "";
        selectedPhotoFile = null;

        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        function (event) {

          photoPreview.innerHTML = `

            <img
              src="${event.target.result}"
              class="preview-image"
              alt="Member Photo Preview"
            >

          `;

        };


      reader.readAsDataURL(file);

    }
  );

}


// ========================================
// FORM SUBMIT
// ========================================

if (memberForm) {

  memberForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      if (editingId === null) {

        await addMember();

      } else {

        await updateMember();

      }

    }
  );

}


// ========================================
// CANCEL
// ========================================

if (cancelButton) {

  cancelButton.addEventListener(
    "click",
    function () {

      resetForm();

    }
  );

}


// ========================================
// GET FORM DATA
// ========================================

function getFormData() {

  return {

    member_id:
      memberId.value.trim(),

    full_name:
      fullName.value.trim(),

    passport_number:
      passportNumber.value.trim(),

    birthday:
      birthday.value || null,

    address:
      address.value.trim(),

    contact_number:
      contact.value.trim(),

    emergency_contact_person:
      emergencyContact.value.trim(),

    emergency_contact_number:
      emergencyNumber.value.trim(),

    membership_status:
      status.value || "Active"

  };

}


// ========================================
// UPLOAD PHOTO
// ========================================

async function uploadPhoto(file) {

  if (!file) {
    return null;
  }


  const extension =
    getFileExtension(file.name);


  const fileName =
    "member_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .substring(2, 10) +
    extension;


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

    throw new Error(

      "PHOTO UPLOAD FAILED\n\n" +

      "Message: " +
      error.message +

      "\n\nCode: " +
      (error.statusCode || "N/A") +

      "\n\nDetails: " +
      (error.statusText || "N/A")

    );

  }


  console.log(
    "PHOTO UPLOADED:",
    data
  );


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
      "Photo uploaded but public URL was not created."
    );

  }


  console.log(
    "PHOTO URL:",
    publicData.publicUrl
  );


  return publicData.publicUrl;

}


// ========================================
// FILE EXTENSION
// ========================================

function getFileExtension(filename) {

  const dot =
    filename.lastIndexOf(".");


  if (dot === -1) {
    return ".jpg";
  }


  return filename
    .substring(dot)
    .toLowerCase();

}


// ========================================
// ADD MEMBER
// ========================================

async function addMember() {

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


  saveButton.disabled = true;
  saveButton.textContent = "Saving...";


  try {

    let photoUrl = null;


    // Upload photo first
    if (selectedPhotoFile) {

      photoUrl =
        await uploadPhoto(
          selectedPhotoFile
        );

    }


    member.photo_url =
      photoUrl;


    console.log(
      "SAVING MEMBER:",
      member
    );


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

      showError(
        "REGISTRATION FAILED",
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
      "ADD MEMBER ERROR\n\n" +
      error.message
    );

  }

  finally {

    saveButton.disabled = false;

    saveButton.textContent =
      "Add Member";

  }

}


// ========================================
// UPDATE MEMBER
// ========================================

async function updateMember() {

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


  saveButton.disabled = true;
  saveButton.textContent = "Updating...";


  try {

    let photoUrl =
      currentPhotoUrl;


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

      showError(
        "UPDATE FAILED",
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
      error.message
    );

  }

  finally {

    saveButton.disabled = false;

    saveButton.textContent =
      "Add Member";

  }

}


// ========================================
// LOAD MEMBERS
// ========================================

async function loadMembers() {

  memberTable.innerHTML = "";

  emptyMessage.textContent =
    "Loading members...";

  emptyMessage.style.display =
    "block";


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

      showError(
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

      emptyMessage.textContent =
        "No member records found.";

      return;

    }


    emptyMessage.style.display =
      "none";


    displayMembers(data);

  }

  catch (error) {

    console.error(
      "LOAD ERROR:",
      error
    );


    alert(
      "LOAD ERROR\n\n" +
      error.message
    );

  }

}


// ========================================
// DISPLAY MEMBERS
// ========================================

function displayMembers(data) {

  memberTable.innerHTML = "";


  data.forEach(
    function (member) {

      const row =
        document.createElement("tr");


      const statusClass =
        member.membership_status === "Active"
          ? "status-active"
          : "status-inactive";


      let photoHTML;


      if (member.photo_url) {

        photoHTML = `

          <img
            src="${escapeHTML(member.photo_url)}"
            class="member-photo"
            alt="Member Photo"
            loading="lazy"
            onerror="
              this.style.display='none';
              this.nextElementSibling.style.display='flex';
            "
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


// ========================================
// ACTION BUTTONS
// ========================================

memberTable.addEventListener(
  "click",
  async function (event) {

    const button =
      event.target.closest("button");


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


    if (action === "view") {

      await viewMember(id);

    }


    if (action === "edit") {

      await editMember(id);

    }


    if (action === "delete") {

      await deleteMember(
        id,
        button.dataset.name || ""
      );

    }

  }
);


// ========================================
// VIEW MEMBER
// ========================================

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

      showError(
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


    const photoHTML =
      data.photo_url

        ? `

          <img
            src="${escapeHTML(
              data.photo_url
            )}"
            class="profile-photo"
            alt="Member Photo"
          >

        `

        : `

          <div class="profile-no-photo">
            No Photo
          </div>

        `;


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
            onclick="closeMemberProfile()"
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
                data.member_id || ""
              )}
            </p>

          </div>


          <div class="profile-details">

            <div>
              <strong>Passport Number</strong>
              <span>
                ${escapeHTML(
                  data.passport_number || "-"
                )}
              </span>
            </div>


            <div>
              <strong>Birthday</strong>
              <span>
                ${escapeHTML(
                  data.birthday || "-"
                )}
              </span>
            </div>


            <div>
              <strong>Address</strong>
              <span>
                ${escapeHTML(
                  data.address || "-"
                )}
              </span>
            </div>


            <div>
              <strong>Contact Number</strong>
              <span>
                ${escapeHTML(
                  data.contact_number || "-"
                )}
              </span>
            </div>


            <div>
              <strong>Emergency Contact</strong>
              <span>
                ${escapeHTML(
                  data.emergency_contact_person || "-"
                )}
              </span>
            </div>


            <div>
              <strong>Emergency Number</strong>
              <span>
                ${escapeHTML(
                  data.emergency_contact_number || "-"
                )}
              </span>
            </div>


            <div>
              <strong>Membership Status</strong>
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
              onclick="
                closeMemberProfile();
                editMember(${data.id});
              "
            >
              Edit
            </button>


            <button
              type="button"
              class="btn-secondary"
              onclick="closeMemberProfile()"
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

  }

  catch (error) {

    console.error(
      "VIEW ERROR:",
      error
    );


    alert(
      "VIEW ERROR\n\n" +
      error.message
    );

  }

}


// ========================================
// CLOSE PROFILE
// ========================================

function closeMemberProfile() {

  const overlay =
    document.getElementById(
      "memberProfileOverlay"
    );


  if (overlay) {
    overlay.remove();
  }

}


// ========================================
// EDIT MEMBER
// ========================================

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

      showError(
        "EDIT FAILED",
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


    currentPhotoUrl =
      data.photo_url || null;


    selectedPhotoFile =
      null;


    photo.value = "";


    if (currentPhotoUrl) {

      showPhotoPreview(
        currentPhotoUrl
      );

    } else {

      photoPreview.innerHTML = "";

    }


    editingId =
      data.id;


    formTitle.textContent =
      "Edit Member";


    saveButton.textContent =
      "Update Member";


    cancelButton.classList.remove(
      "hidden"
    );


    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  }

  catch (error) {

    console.error(
      "EDIT ERROR:",
      error
    );


    alert(
      "EDIT ERROR\n\n" +
      error.message
    );

  }

}


// ========================================
// DELETE MEMBER
// ========================================

async function deleteMember(
  id,
  name
) {

  const confirmed =
    confirm(

      "Are you sure you want to delete this member?\n\n" +
      "Member: " +
      name

    );


  if (!confirmed) {
    return;
  }


  try {

    const {
      data: member,
      error: findError
    } =
      await supabaseClient
        .from("members")
        .select("photo_url")
        .eq("id", id)
        .single();


    if (findError) {

      showError(
        "DELETE FAILED",
        findError
      );

      return;

    }


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

      showError(
        "DELETE FAILED",
        error
      );

      return;

    }


    // Try to delete the photo from Storage
    // if the member has a photo.
    if (member && member.photo_url) {

      try {

        const photoPath =
          getStorageFileName(
            member.photo_url
          );


        if (photoPath) {

          const {
            error: photoDeleteError
          } =
            await supabaseClient
              .storage
              .from(PHOTO_BUCKET)
              .remove([
                photoPath
              ]);


          if (photoDeleteError) {

            console.warn(
              "Photo deletion failed:",
              photoDeleteError
            );

          }

        }

      }

      catch (photoError) {

        console.warn(
          "Photo cleanup failed:",
          photoError
        );

      }

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
      error.message
    );

  }

}


// ========================================
// SEARCH
// ========================================

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

            );


        if (error) {

          showError(
            "SEARCH FAILED",
            error
          );

          return;

        }


        if (
          !data ||
          data.length === 0
        ) {

          memberTable.innerHTML = "";

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
          error.message
        );

      }

    }
  );

}


// ========================================
// RESET FORM
// ========================================

function resetForm() {

  memberForm.reset();


  editingId = null;

  currentPhotoUrl = null;

  selectedPhotoFile = null;


  photoPreview.innerHTML = "";


  formTitle.textContent =
    "Add Member";


  saveButton.textContent =
    "Add Member";


  cancelButton.classList.add(
    "hidden"
  );

}


// ========================================
// PHOTO PREVIEW
// ========================================

function showPhotoPreview(url) {

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
      onerror="
        this.style.display='none';
      "
    >

  `;

}


// ========================================
// GET STORAGE FILE NAME
// ========================================

function getStorageFileName(url) {

  if (!url) {
    return null;
  }


  const marker =
    "/storage/v1/object/public/" +
    PHOTO_BUCKET +
    "/";


  const index =
    url.indexOf(marker);


  if (index === -1) {
    return null;
  }


  return decodeURIComponent(
    url.substring(
      index + marker.length
    )
  );

}


// ========================================
// ERROR DISPLAY
// ========================================

function showError(
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


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

  return String(value)

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


// ========================================
// START APPLICATION
// ========================================

loadMembers();
