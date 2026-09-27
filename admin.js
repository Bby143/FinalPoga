// ========================================
// POGA KSA ADMIN MEMBER MANAGEMENT SYSTEM
// ========================================


// ========================================
// SUPABASE CONFIGURATION
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
// STORAGE
// ========================================

const PHOTO_BUCKET = "member-photos";


// ========================================
// LOGIN ELEMENTS
// ========================================

const loginSection =
  document.getElementById("loginSection");

const dashboardSection =
  document.getElementById("dashboardSection");

const loginForm =
  document.getElementById("loginForm");

const loginEmail =
  document.getElementById("loginEmail");

const loginPassword =
  document.getElementById("loginPassword");

const loginButton =
  document.getElementById("loginButton");

const logoutButton =
  document.getElementById("logoutButton");

const adminEmailDisplay =
  document.getElementById("adminEmailDisplay");


// ========================================
// MEMBER FORM ELEMENTS
// ========================================

const memberForm =
  document.getElementById("memberForm");

const formTitle =
  document.getElementById("formTitle");

const memberId =
  document.getElementById("memberId");

const fullName =
  document.getElementById("fullName");

const passportNumber =
  document.getElementById("passportNumber");

const birthday =
  document.getElementById("birthday");

const country =
  document.getElementById("country");

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

const saveButton =
  document.getElementById("saveButton");

const cancelEditButton =
  document.getElementById("cancelEditButton");


// ========================================
// MEMBER RECORD ELEMENTS
// ========================================

const membersTableBody =
  document.getElementById("membersTableBody");

const searchInput =
  document.getElementById("searchInput");


// ========================================
// MEMBER DETAILS MODAL ELEMENTS
// ========================================

const memberDetailsModal =
  document.getElementById(
    "memberDetailsModal"
  );

const closeDetailsButton =
  document.getElementById(
    "closeDetailsButton"
  );

const detailsCloseButton =
  document.getElementById(
    "detailsCloseButton"
  );

const detailsEditButton =
  document.getElementById(
    "detailsEditButton"
  );

const detailsPhoto =
  document.getElementById(
    "detailsPhoto"
  );

const detailsMemberId =
  document.getElementById(
    "detailsMemberId"
  );

const detailsFullName =
  document.getElementById(
    "detailsFullName"
  );

const detailsPassport =
  document.getElementById(
    "detailsPassport"
  );

const detailsBirthday =
  document.getElementById(
    "detailsBirthday"
  );

const detailsCountry =
  document.getElementById(
    "detailsCountry"
  );

const detailsAddress =
  document.getElementById(
    "detailsAddress"
  );

const detailsContact =
  document.getElementById(
    "detailsContact"
  );

const detailsEmergencyPerson =
  document.getElementById(
    "detailsEmergencyPerson"
  );

const detailsEmergencyNumber =
  document.getElementById(
    "detailsEmergencyNumber"
  );

const detailsStatus =
  document.getElementById(
    "detailsStatus"
  );


// ========================================
// STATE
// ========================================

let editingId = null;

let currentPhotoUrl = null;

let selectedPhotoFile = null;

let currentDetailsMemberId = null;


// ========================================
// CHECK AUTHENTICATION
// ========================================

async function checkAuth() {

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.getSession();


    if (error) {

      console.error(
        "Auth session error:",
        error
      );

      showLogin();

      return;
    }


    const session =
      data?.session;


    if (session?.user) {

      showDashboard(
        session.user
      );

    } else {

      showLogin();

    }

  } catch (error) {

    console.error(
      "Authentication check error:",
      error
    );

    showLogin();

  }

}


// ========================================
// SHOW LOGIN
// ========================================

function showLogin() {

  loginSection.classList.remove(
    "hidden"
  );

  dashboardSection.classList.add(
    "hidden"
  );

  adminEmailDisplay.textContent =
    "Admin";

}


// ========================================
// SHOW DASHBOARD
// ========================================

async function showDashboard(user) {

  loginSection.classList.add(
    "hidden"
  );

  dashboardSection.classList.remove(
    "hidden"
  );


  if (user?.email) {

    adminEmailDisplay.textContent =
      user.email;

  } else {

    adminEmailDisplay.textContent =
      "Admin";

  }


  await loadMembers();

}


// ========================================
// ADMIN LOGIN
// ========================================

loginForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    try {

      loginButton.disabled = true;

      loginButton.textContent =
        "Logging in...";


      const email =
        loginEmail.value.trim();

      const password =
        loginPassword.value;


      const {
        data,
        error
      } =
        await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });


      if (error) {

        console.error(
          "Login error:",
          error
        );

        alert(
          error.message ||
          "Unable to login."
        );

        return;
      }


      if (data?.user) {

        loginPassword.value = "";

        await showDashboard(
          data.user
        );

      }

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      alert(
        error.message ||
        "Unable to login."
      );

    } finally {

      loginButton.disabled = false;

      loginButton.textContent =
        "Login";

    }

  }
);


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
  "click",
  async function () {

    try {

      const {
        error
      } =
        await supabaseClient.auth.signOut();


      if (error) {

        console.error(
          "Logout error:",
          error
        );

        alert(
          error.message ||
          "Unable to logout."
        );

        return;
      }


      closeMemberDetails();

      resetForm();

      showLogin();

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

      alert(
        error.message ||
        "Unable to logout."
      );

    }

  }
);


// ========================================
// AUTH STATE CHANGES
// ========================================

supabaseClient.auth.onAuthStateChange(
  async function (event, session) {

    if (
      event === "SIGNED_IN" &&
      session?.user
    ) {

      loginSection.classList.add(
        "hidden"
      );

      dashboardSection.classList.remove(
        "hidden"
      );

      adminEmailDisplay.textContent =
        session.user.email ||
        "Admin";

    }


    if (
      event === "SIGNED_OUT"
    ) {

      closeMemberDetails();

      resetForm();

      showLogin();

    }

  }
);


// ========================================
// PHOTO VALIDATION
// ========================================

photo.addEventListener(
  "change",
  function () {

    selectedPhotoFile =
      photo.files[0] || null;


    photoPreview.innerHTML =
      "";


    if (!selectedPhotoFile) {

      return;

    }


    // Check image
    if (
      !selectedPhotoFile.type.startsWith(
        "image/"
      )
    ) {

      alert(
        "Please select an image file."
      );

      photo.value = "";

      selectedPhotoFile = null;

      return;

    }


    // Maximum 5MB
    const maxSize =
      5 * 1024 * 1024;


    if (
      selectedPhotoFile.size >
      maxSize
    ) {

      alert(
        "Photo size must not exceed 5MB."
      );

      photo.value = "";

      selectedPhotoFile = null;

      return;

    }


    // Preview
    const reader =
      new FileReader();


    reader.onload =
      function (event) {

        const img =
          document.createElement(
            "img"
          );

        img.src =
          event.target.result;

        img.alt =
          "Photo Preview";

        img.className =
          "preview-image";

        photoPreview.appendChild(
          img
        );

      };


    reader.readAsDataURL(
      selectedPhotoFile
    );

  }
);


// ========================================
// UPLOAD PHOTO
// ========================================

async function uploadPhoto(file) {

  if (!file) {

    return null;

  }


  const originalName =
    file.name || "";


  const extension =
    originalName.includes(".")
      ? originalName
          .split(".")
          .pop()
          .toLowerCase()
      : "jpg";


  const fileName =
    `member_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}.${extension}`;


  const {
    error: uploadError
  } =
    await supabaseClient
      .storage
      .from(PHOTO_BUCKET)
      .upload(
        fileName,
        file,
        {
          cacheControl: "3600",
          upsert: false
        }
      );


  if (uploadError) {

    console.error(
      "Photo upload error:",
      uploadError
    );

    throw new Error(
      uploadError.message ||
      "Unable to upload photo."
    );

  }


  const {
    data
  } =
    supabaseClient
      .storage
      .from(PHOTO_BUCKET)
      .getPublicUrl(
        fileName
      );


  if (
    !data ||
    !data.publicUrl
  ) {

    throw new Error(
      "Unable to create photo URL."
    );

  }


  return data.publicUrl;

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

    country:
      country.value || null,

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
// SAVE MEMBER
// ADD OR UPDATE
// ========================================

memberForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    try {

      saveButton.disabled = true;

      saveButton.textContent =
        editingId
          ? "Updating..."
          : "Adding...";


      const formData =
        getFormData();


      // ==================================
      // UPDATE MEMBER
      // ==================================

      if (editingId) {

        let updateData = {
          ...formData
        };


        // Upload new photo only if selected
        if (selectedPhotoFile) {

          const newPhotoUrl =
            await uploadPhoto(
              selectedPhotoFile
            );

          updateData.photo_url =
            newPhotoUrl;

        }


        const {
          error
        } =
          await supabaseClient
            .from("members")
            .update(updateData)
            .eq("id", editingId);


        if (error) {

          console.error(
            "Update member error:",
            error
          );

          throw new Error(
            error.message ||
            "Unable to update member."
          );

        }


        alert(
          "Member updated successfully."
        );


        resetForm();

        await loadMembers();

        return;

      }


      // ==================================
      // ADD MEMBER
      // ==================================

      if (!selectedPhotoFile) {

        throw new Error(
          "Please select a member photo."
        );

      }


      const photoUrl =
        await uploadPhoto(
          selectedPhotoFile
        );


      const newMember = {

        ...formData,

        photo_url:
          photoUrl

      };


      const {
        error
      } =
        await supabaseClient
          .from("members")
          .insert([
            newMember
          ]);


      if (error) {

        console.error(
          "Add member error:",
          error
        );

        throw new Error(
          error.message ||
          "Unable to add member."
        );

      }


      alert(
        "Member added successfully."
      );


      resetForm();

      await loadMembers();


    } catch (error) {

      console.error(
        "Save member error:",
        error
      );

      alert(
        error.message ||
        "Something went wrong."
      );

    } finally {

      saveButton.disabled = false;

      saveButton.textContent =
        editingId
          ? "Update Member"
          : "Add Member";

    }

  }
);


// ========================================
// LOAD MEMBERS
// ========================================

async function loadMembers() {

  try {

    membersTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-message">
          Loading members...
        </td>
      </tr>
    `;


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
        "Load members error:",
        error
      );

      membersTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-message">
            Unable to load member records.
          </td>
        </tr>
      `;

      return;

    }


    displayMembers(
      data || []
    );


  } catch (error) {

    console.error(
      "Load members error:",
      error
    );

    membersTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-message">
          Unable to load member records.
        </td>
      </tr>
    `;

  }

}


// ========================================
// DISPLAY MEMBERS
// ========================================

function displayMembers(
  members
) {

  if (
    !members ||
    members.length === 0
  ) {

    membersTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-message">
          No member records found.
        </td>
      </tr>
    `;

    return;

  }


  membersTableBody.innerHTML =
    members.map(
      function (member) {


        // ================================
        // PHOTO
        // ================================

        let photoHTML =
          `
            <div class="no-photo">
              No Photo
            </div>
          `;


        if (
          member.photo_url
        ) {

          photoHTML =
            `
              <img
                src="${escapeHTML(
                  member.photo_url
                )}"
                alt="Member Photo"
                class="member-photo"
              >
            `;

        }


        // ================================
        // STATUS
        // ================================

        const statusClass =
          member.membership_status ===
          "Active"
            ? "status-active"
            : "status-inactive";


        const safeStatus =
          escapeHTML(
            member.membership_status ||
            "-"
          );


        // ================================
        // TABLE ROW
        // ================================

        return `

          <tr>

            <td>
              ${photoHTML}
            </td>

            <td>
              ${escapeHTML(
                member.member_id || "-"
              )}
            </td>

            <td>
              ${escapeHTML(
                member.full_name || "-"
              )}
            </td>

            <td>
              ${escapeHTML(
                member.passport_number || "-"
              )}
            </td>

            <td>
              ${escapeHTML(
                formatDate(
                  member.birthday
                )
              )}
            </td>

            <td>
              ${escapeHTML(
                member.contact_number || "-"
              )}
            </td>

            <td>
              <span class="${statusClass}">
                ${safeStatus}
              </span>
            </td>

            <td>

              <button
                type="button"
                class="btn-primary btn-small"
                onclick="viewMember(${Number(
                  member.id
                )})"
              >
                View Details
              </button>

              <button
                type="button"
                class="btn-edit"
                onclick="editMember(${Number(
                  member.id
                )})"
              >
                Edit
              </button>

              <button
                type="button"
                class="btn-delete"
                onclick="deleteMember(${Number(
                  member.id
                )})"
              >
                Delete
              </button>

            </td>

          </tr>

        `;

      }
    )
    .join("");

}


// ========================================
// VIEW MEMBER DETAILS
// ========================================

async function viewMember(
  id
) {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("members")
        .select("*")
        .eq("id", id)
        .single();


    if (error) {

      console.error(
        "View member error:",
        error
      );

      alert(
        error.message ||
        "Unable to load member details."
      );

      return;

    }


    if (!data) {

      alert(
        "Member record not found."
      );

      return;

    }


    currentDetailsMemberId =
      data.id;


    // ==================================
    // PHOTO
    // ==================================

    if (data.photo_url) {

      detailsPhoto.innerHTML = `
        <img
          src="${escapeHTML(
            data.photo_url
          )}"
          alt="Member Photo"
        >
      `;

    } else {

      detailsPhoto.innerHTML = `
        <div class="no-photo">
          No Photo
        </div>
      `;

    }


    // ==================================
    // DETAILS
    // ==================================

    detailsMemberId.textContent =
      data.member_id || "-";

    detailsFullName.textContent =
      data.full_name || "-";

    detailsPassport.textContent =
      data.passport_number || "-";

    detailsBirthday.textContent =
      formatDate(
        data.birthday
      );

    detailsCountry.textContent =
      data.country || "-";

    detailsAddress.textContent =
      data.address || "-";

    detailsContact.textContent =
      data.contact_number || "-";

    detailsEmergencyPerson.textContent =
      data.emergency_contact_person || "-";

    detailsEmergencyNumber.textContent =
      data.emergency_contact_number || "-";

    detailsStatus.textContent =
      data.membership_status || "-";


    // ==================================
    // STATUS STYLE
    // ==================================

    detailsStatus.className = "";

    if (
      data.membership_status ===
      "Active"
    ) {

      detailsStatus.classList.add(
        "status-active"
      );

    } else {

      detailsStatus.classList.add(
        "status-inactive"
      );

    }


    // ==================================
    // OPEN MODAL
    // ==================================

    memberDetailsModal.classList.remove(
      "hidden"
    );

    document.body.style.overflow =
      "hidden";


  } catch (error) {

    console.error(
      "View member error:",
      error
    );

    alert(
      error.message ||
      "Unable to load member details."
    );

  }

}


// ========================================
// CLOSE MEMBER DETAILS
// ========================================

function closeMemberDetails() {

  memberDetailsModal.classList.add(
    "hidden"
  );

  currentDetailsMemberId =
    null;

  document.body.style.overflow =
    "";

}


// ========================================
// CLOSE MODAL BUTTONS
// ========================================

closeDetailsButton.addEventListener(
  "click",
  function () {

    closeMemberDetails();

  }
);


detailsCloseButton.addEventListener(
  "click",
  function () {

    closeMemberDetails();

  }
);


// ========================================
// EDIT FROM DETAILS MODAL
// ========================================

detailsEditButton.addEventListener(
  "click",
  async function () {

    if (
      !currentDetailsMemberId
    ) {

      return;

    }


    const id =
      currentDetailsMemberId;


    closeMemberDetails();

    await editMember(id);

  }
);


// ========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ========================================

memberDetailsModal.addEventListener(
  "click",
  function (event) {

    if (
      event.target ===
      memberDetailsModal
    ) {

      closeMemberDetails();

    }

  }
);


// ========================================
// CLOSE MODAL WITH ESC KEY
// ========================================

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key === "Escape" &&
      !memberDetailsModal.classList.contains(
        "hidden"
      )
    ) {

      closeMemberDetails();

    }

  }
);


// ========================================
// EDIT MEMBER
// ========================================

async function editMember(
  id
) {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("members")
        .select("*")
        .eq("id", id)
        .single();


    if (error) {

      console.error(
        "Edit member error:",
        error
      );

      alert(
        error.message ||
        "Unable to load member."
      );

      return;

    }


    if (!data) {

      alert(
        "Member record not found."
      );

      return;

    }


    // ==================================
    // SET EDIT MODE
    // ==================================

    editingId =
      data.id;


    formTitle.textContent =
      "Edit Member";

    saveButton.textContent =
      "Update Member";

    cancelEditButton.classList.remove(
      "hidden"
    );


    // ==================================
    // FILL FORM
    // ==================================

    memberId.value =
      data.member_id || "";

    fullName.value =
      data.full_name || "";

    passportNumber.value =
      data.passport_number || "";

    birthday.value =
      data.birthday || "";

    country.value =
      data.country || "";

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


    // ==================================
    // EXISTING PHOTO
    // ==================================

    currentPhotoUrl =
      data.photo_url || null;


    selectedPhotoFile =
      null;


    photo.value =
      "";


    photoPreview.innerHTML =
      "";


    if (data.photo_url) {

      photoPreview.innerHTML = `
        <img
          src="${escapeHTML(
            data.photo_url
          )}"
          alt="Current Member Photo"
          class="preview-image"
        >
      `;

    }


    // ==================================
    // SCROLL TO FORM
    // ==================================

    memberForm.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


  } catch (error) {

    console.error(
      "Edit member error:",
      error
    );

    alert(
      error.message ||
      "Unable to edit member."
    );

  }

}


// ========================================
// CANCEL EDIT
// ========================================

cancelEditButton.addEventListener(
  "click",
  function () {

    resetForm();

  }
);


// ========================================
// DELETE MEMBER
// ========================================

async function deleteMember(
  id
) {

  try {

    const confirmed =
      confirm(
        "Are you sure you want to delete this member?"
      );


    if (!confirmed) {

      return;

    }


    const {
      error
    } =
      await supabaseClient
        .from("members")
        .delete()
        .eq("id", id);


    if (error) {

      console.error(
        "Delete member error:",
        error
      );

      alert(
        error.message ||
        "Unable to delete member."
      );

      return;

    }


    alert(
      "Member deleted successfully."
    );


    if (
      editingId === id
    ) {

      resetForm();

    }


    if (
      currentDetailsMemberId === id
    ) {

      closeMemberDetails();

    }


    await loadMembers();


  } catch (error) {

    console.error(
      "Delete member error:",
      error
    );

    alert(
      error.message ||
      "Unable to delete member."
    );

  }

      }
// ========================================
// SEARCH MEMBERS
// ========================================

searchInput.addEventListener(
  "input",
  async function () {

    const searchTerm =
      searchInput.value.trim();


    if (!searchTerm) {

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
            `member_id.ilike.%${escapeSearchValue(
              searchTerm
            )}%,full_name.ilike.%${escapeSearchValue(
              searchTerm
            )}%,passport_number.ilike.%${escapeSearchValue(
              searchTerm
            )}%,contact_number.ilike.%${escapeSearchValue(
              searchTerm
            )}%`
          )
          .order(
            "id",
            {
              ascending: false
            }
          );


      if (error) {

        console.error(
          "Search error:",
          error
        );

        membersTableBody.innerHTML = `
          <tr>
            <td colspan="8" class="empty-message">
              Unable to search members.
            </td>
          </tr>
        `;

        return;

      }


      displayMembers(
        data || []
      );


    } catch (error) {

      console.error(
        "Search error:",
        error
      );

      membersTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-message">
            Unable to search members.
          </td>
        </tr>
      `;

    }

  }
);


// ========================================
// RESET FORM
// ========================================

function resetForm() {

  editingId =
    null;

  currentPhotoUrl =
    null;

  selectedPhotoFile =
    null;


  memberForm.reset();


  formTitle.textContent =
    "Add Member";


  saveButton.textContent =
    "Add Member";


  cancelEditButton.classList.add(
    "hidden"
  );


  photoPreview.innerHTML =
    "";


  photo.value =
    "";


  status.value =
    "Active";

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(
  dateValue
) {

  if (!dateValue) {

    return "-";

  }


  const date =
    new Date(
      dateValue + "T00:00:00"
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return dateValue;

  }


  return date.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


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
// ESCAPE SEARCH VALUE
// ========================================

function escapeSearchValue(
  value
) {

  return String(value)
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /%/g,
      "\\%"
    )
    .replace(
      /_/g,
      "\\_"
    )
    .replace(
      /,/g,
      "\\,"
    )
    .replace(
      /\(/g,
      "\\("
    )
    .replace(
      /\)/g,
      "\\)"
    );

}


// ========================================
// INITIAL AUTH CHECK
// ========================================

checkAuth();
