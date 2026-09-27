const SUPABASE_URL = "https://rocvqcqgbdohfwfkhncy.supabase.co";
const SUPABASE_KEY = "sb_publishable_wStACVHPYgU82oxbsvAWTg_EdkHrQaF";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const PHOTO_BUCKET = "member-photos";


// =========================
// ELEMENTS
// =========================

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginButton = document.getElementById("loginButton");
const loginError = document.getElementById("loginError");

const adminEmail = document.getElementById("adminEmail");
const logoutButton = document.getElementById("logoutButton");

const memberForm = document.getElementById("memberForm");
const formTitle = document.getElementById("formTitle");

const memberId = document.getElementById("memberId");
const fullName = document.getElementById("fullName");
const passportNumber = document.getElementById("passportNumber");
const birthday = document.getElementById("birthday");

const country = document.getElementById("country");
const address = document.getElementById("address");

const contact = document.getElementById("contact");
const emergencyContact = document.getElementById("emergencyContact");
const emergencyNumber = document.getElementById("emergencyNumber");

const status = document.getElementById("status");

const photo = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");

const saveButton = document.getElementById("saveButton");
const cancelEditButton = document.getElementById("cancelEditButton");

const formMessage = document.getElementById("formMessage");

const searchInput = document.getElementById("searchInput");
const membersTableBody = document.getElementById("membersTableBody");


// =========================
// MEMBER DETAILS MODAL
// =========================

const memberDetailsModal =
  document.getElementById("memberDetailsModal");

const closeDetailsButton =
  document.getElementById("closeDetailsButton");

const detailsPhoto =
  document.getElementById("detailsPhoto");

const detailsMemberId =
  document.getElementById("detailsMemberId");

const detailsFullName =
  document.getElementById("detailsFullName");

const detailsPassport =
  document.getElementById("detailsPassport");

const detailsBirthday =
  document.getElementById("detailsBirthday");

const detailsCountry =
  document.getElementById("detailsCountry");

const detailsContact =
  document.getElementById("detailsContact");

const detailsAddress =
  document.getElementById("detailsAddress");

const detailsEmergencyPerson =
  document.getElementById("detailsEmergencyPerson");

const detailsEmergencyNumber =
  document.getElementById("detailsEmergencyNumber");

const detailsStatus =
  document.getElementById("detailsStatus");

const detailsEditButton =
  document.getElementById("detailsEditButton");

const detailsCloseButton =
  document.getElementById("detailsCloseButton");


// =========================
// VARIABLES
// =========================

let editingId = null;
let currentPhotoUrl = null;
let selectedPhotoFile = null;
let currentDetailsMemberId = null;


// =========================
// AUTH CHECK
// =========================

async function checkAuth() {

  const {
    data,
    error
  } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Auth error:", error);
    showLogin();
    return;
  }

  if (data.session) {
    showDashboard(data.session.user);
  } else {
    showLogin();
  }
}


// =========================
// SHOW LOGIN
// =========================

function showLogin() {

  loginSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");

  if (adminEmail) {
    adminEmail.textContent = "";
  }
}


// =========================
// SHOW DASHBOARD
// =========================

async function showDashboard(user) {

  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");

  if (adminEmail) {
    adminEmail.textContent = user.email || "";
  }

  await loadMembers();
}


// =========================
// LOGIN
// =========================

loginForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  loginError.textContent = "";
  loginError.classList.add("hidden");

  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  const {
    data,
    error
  } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  loginButton.disabled = false;
  loginButton.textContent = "Login";

  if (error) {

    console.error("Login error:", error);

    loginError.textContent =
      "Login failed. Please check your email and password.";

    loginError.classList.remove("hidden");

    return;
  }

  loginForm.reset();

  if (data.user) {
    await showDashboard(data.user);
  }
});


// =========================
// LOGOUT
// =========================

logoutButton.addEventListener("click", async () => {

  const {
    error
  } = await supabaseClient.auth.signOut();

  if (error) {

    console.error("Logout error:", error);

    alert("Logout failed.");

    return;
  }

  closeDetailsModal();
  resetForm();
  showLogin();
});


// =========================
// AUTH STATE
// =========================

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    if (event === "SIGNED_IN" && session) {
      await showDashboard(session.user);
    }

    if (event === "SIGNED_OUT") {
      closeDetailsModal();
      resetForm();
      showLogin();
    }
  }
);


// =========================
// PHOTO VALIDATION
// =========================

photo.addEventListener("change", () => {

  selectedPhotoFile = null;

  const file = photo.files[0];

  if (!file) {

    photoPreview.innerHTML = "";

    return;
  }

  if (!file.type.startsWith("image/")) {

    alert("Please select an image file.");

    photo.value = "";

    photoPreview.innerHTML = "";

    return;
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {

    alert("Photo must not exceed 5MB.");

    photo.value = "";

    photoPreview.innerHTML = "";

    return;
  }

  selectedPhotoFile = file;

  showPhotoPreview(file);
});


// =========================
// SHOW PHOTO PREVIEW
// =========================

function showPhotoPreview(file) {

  const reader = new FileReader();

  reader.onload = (event) => {

    photoPreview.innerHTML = `
      <img
        src="${event.target.result}"
        alt="Photo Preview"
        class="member-photo"
      >
    `;
  };

  reader.readAsDataURL(file);
}


// =========================
// UPLOAD PHOTO
// =========================

async function uploadPhoto(file) {

  if (!file) {
    return null;
  }

  const extension =
    file.name.split(".").pop().toLowerCase();

  const fileName =
    `member_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}.${extension}`;

  const filePath = fileName;

  const {
    error: uploadError
  } = await supabaseClient.storage
    .from(PHOTO_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (uploadError) {

    console.error("Photo upload error:", uploadError);

    throw new Error(
      "Photo upload failed: " + uploadError.message
    );
  }

  const {
    data
  } = supabaseClient.storage
    .from(PHOTO_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}


// =========================
// GET FORM DATA
// =========================

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

    country_of_work:
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
      status.value,

  };
}


// =========================
// ADD / UPDATE MEMBER
// =========================

memberForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  formMessage.textContent = "";
  formMessage.classList.add("hidden");

  saveButton.disabled = true;
  saveButton.textContent =
    editingId ? "Updating..." : "Saving...";

  try {

    const formData = getFormData();


    // =========================
    // ADD MEMBER
    // =========================

    if (!editingId) {

      if (!selectedPhotoFile) {

        alert("Please select a member photo.");

        saveButton.disabled = false;
        saveButton.textContent = "Save Member";

        return;
      }

      const photoUrl =
        await uploadPhoto(selectedPhotoFile);

      formData.photo_url = photoUrl;

      const {
        error
      } = await supabaseClient
        .from("members")
        .insert([formData]);

      if (error) {

        console.error("Insert error:", error);

        throw new Error(error.message);
      }

      showFormMessage(
        "Member successfully added."
      );
    }


    // =========================
    // UPDATE MEMBER
    // =========================

    else {

      if (selectedPhotoFile) {

        const photoUrl =
          await uploadPhoto(selectedPhotoFile);

        formData.photo_url = photoUrl;

      } else {

        formData.photo_url =
          currentPhotoUrl;
      }


      const {
        error
      } = await supabaseClient
        .from("members")
        .update(formData)
        .eq("id", editingId);

      if (error) {

        console.error("Update error:", error);

        throw new Error(error.message);
      }

      showFormMessage(
        "Member successfully updated."
      );
    }


    resetForm();

    await loadMembers();

  } catch (error) {

    console.error(error);

    alert(
      "Unable to save member:\n\n" +
      error.message
    );

  } finally {

    saveButton.disabled = false;

    saveButton.textContent =
      editingId
        ? "Update Member"
        : "Save Member";
  }
});


// =========================
// SHOW FORM MESSAGE
// =========================

function showFormMessage(message) {

  formMessage.textContent = message;

  formMessage.classList.remove("hidden");

  setTimeout(() => {
    formMessage.classList.add("hidden");
  }, 4000);
}


// =========================
// LOAD MEMBERS
// =========================

async function loadMembers(searchTerm = "") {

  let query = supabaseClient
    .from("members")
    .select("*")
    .order("id", {
      ascending: false
    });


  const search =
    searchTerm.trim();


  if (search) {

    const safeSearch =
      escapeSearchValue(search);

    query = query.or(
      `member_id.ilike.%${safeSearch}%,full_name.ilike.%${safeSearch}%,passport_number.ilike.%${safeSearch}%,contact_number.ilike.%${safeSearch}%`
    );
  }


  const {
    data,
    error
  } = await query;


  if (error) {

    console.error("Load members error:", error);

    membersTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          Unable to load members.
        </td>
      </tr>
    `;

    return;
  }


  displayMembers(data || []);
}


// =========================
// DISPLAY MEMBERS
// =========================

function displayMembers(members) {

  membersTableBody.innerHTML = "";


  if (!members.length) {

    membersTableBody.innerHTML = `
      <tr>
        <td
          colspan="8"
          class="empty-state"
        >
          No members found.
        </td>
      </tr>
    `;

    return;
  }


  members.forEach((member) => {

    const row =
      document.createElement("tr");


    const photoCell =
      document.createElement("td");

    if (member.photo_url) {

      const img =
        document.createElement("img");

      img.src = member.photo_url;
      img.alt = "Member Photo";
      img.className = "member-photo";

      photoCell.appendChild(img);

    } else {

      photoCell.textContent =
        "No Photo";
    }


    const memberIdCell =
      document.createElement("td");

    memberIdCell.textContent =
      member.member_id || "-";


    const nameCell =
      document.createElement("td");

    nameCell.textContent =
      member.full_name || "-";


    const passportCell =
      document.createElement("td");

    passportCell.textContent =
      member.passport_number || "-";


    const birthdayCell =
      document.createElement("td");

    birthdayCell.textContent =
      formatDate(member.birthday);


    const contactCell =
      document.createElement("td");

    contactCell.textContent =
      member.contact_number || "-";


    const statusCell =
      document.createElement("td");

    const statusSpan =
      document.createElement("span");

    statusSpan.className =
      "status " +
      (
        member.membership_status === "Active"
          ? "status-active"
          : "status-inactive"
      );

    statusSpan.textContent =
      member.membership_status || "-";

    statusCell.appendChild(statusSpan);


    // =========================
    // ACTION CELL
    // =========================

    const actionCell =
      document.createElement("td");

    const actions =
      document.createElement("div");

    actions.className =
      "table-actions";


    // VIEW DETAILS
    const viewButton =
      document.createElement("button");

    viewButton.type = "button";
    viewButton.className =
      "btn btn-small btn-primary";

    viewButton.textContent =
      "View Details";

    viewButton.addEventListener(
      "click",
      () => viewMemberDetails(member.id)
    );


    // EDIT
    const editButton =
      document.createElement("button");

    editButton.type = "button";
    editButton.className =
      "btn btn-small btn-secondary";

    editButton.textContent =
      "Edit";

    editButton.addEventListener(
      "click",
      () => editMember(member.id)
    );


    // DELETE
    const deleteButton =
      document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className =
      "btn btn-small btn-danger";

    deleteButton.textContent =
      "Delete";

    deleteButton.addEventListener(
      "click",
      () => deleteMember(member.id)
    );


    actions.appendChild(viewButton);
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    actionCell.appendChild(actions);


    row.appendChild(photoCell);
    row.appendChild(memberIdCell);
    row.appendChild(nameCell);
    row.appendChild(passportCell);
    row.appendChild(birthdayCell);
    row.appendChild(contactCell);
    row.appendChild(statusCell);
    row.appendChild(actionCell);

    membersTableBody.appendChild(row);
  });
}


// =========================
// VIEW MEMBER DETAILS
// =========================

async function viewMemberDetails(id) {

  const {
    data: member,
    error
  } = await supabaseClient
    .from("members")
    .select("*")
    .eq("id", id)
    .single();


  if (error) {

    console.error(
      "View member details error:",
      error
    );

    alert(
      "Unable to load member details."
    );

    return;
  }


  currentDetailsMemberId = member.id;


  detailsPhoto.src =
    member.photo_url || "";

  detailsPhoto.alt =
    member.full_name
      ? `${member.full_name} Photo`
      : "Member Photo";


  detailsMemberId.textContent =
    member.member_id || "-";

  detailsFullName.textContent =
    member.full_name || "-";

  detailsPassport.textContent =
    member.passport_number || "-";

  detailsBirthday.textContent =
    formatDate(member.birthday);

  detailsCountry.textContent =
    member.country_of_work || "-";

  detailsAddress.textContent =
    member.address || "-";

  detailsContact.textContent =
    member.contact_number || "-";

  detailsEmergencyPerson.textContent =
    member.emergency_contact_person || "-";

  detailsEmergencyNumber.textContent =
    member.emergency_contact_number || "-";

  detailsStatus.textContent =
    member.membership_status || "-";


  memberDetailsModal.classList.remove(
    "hidden"
  );
}


// =========================
// CLOSE DETAILS MODAL
// =========================

function closeDetailsModal() {

  memberDetailsModal.classList.add(
    "hidden"
  );

  currentDetailsMemberId = null;

  detailsPhoto.src = "";
}


closeDetailsButton.addEventListener(
  "click",
  closeDetailsModal
);


detailsCloseButton.addEventListener(
  "click",
  closeDetailsModal
);


// Close when clicking outside modal
memberDetailsModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      memberDetailsModal
    ) {
      closeDetailsModal();
    }
  }
);


// Close with ESC
document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape" &&
      !memberDetailsModal.classList.contains(
        "hidden"
      )
    ) {
      closeDetailsModal();
    }
  }
);


// =========================
// EDIT FROM DETAILS
// =========================

detailsEditButton.addEventListener(
  "click",
  async () => {

    if (!currentDetailsMemberId) {
      return;
    }

    const id =
      currentDetailsMemberId;

    closeDetailsModal();

    await editMember(id);
  }
);


// =========================
// EDIT MEMBER
// =========================

async function editMember(id) {

  const {
    data: member,
    error
  } = await supabaseClient
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
      "Unable to load member."
    );

    return;
  }


  editingId = member.id;

  currentPhotoUrl =
    member.photo_url || null;

  selectedPhotoFile = null;


  memberId.value =
    member.member_id || "";

  fullName.value =
    member.full_name || "";

  passportNumber.value =
    member.passport_number || "";

  birthday.value =
    member.birthday || "";

  country.value =
    member.country_of_work || "";

  address.value =
    member.address || "";

  contact.value =
    member.contact_number || "";

  emergencyContact.value =
    member.emergency_contact_person || "";

  emergencyNumber.value =
    member.emergency_contact_number || "";

  status.value =
    member.membership_status || "Active";


  photo.value = "";

  if (member.photo_url) {

    photoPreview.innerHTML = `
      <img
        src="${escapeHTML(member.photo_url)}"
        alt="Current Member Photo"
        class="member-photo"
      >
    `;

  } else {

    photoPreview.innerHTML = "";
  }


  formTitle.textContent =
    "Edit Member";

  saveButton.textContent =
    "Update Member";

  cancelEditButton.classList.remove(
    "hidden"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// =========================
// CANCEL EDIT
// =========================

cancelEditButton.addEventListener(
  "click",
  () => {
    resetForm();
  }
);


// =========================
// DELETE MEMBER
// =========================

async function deleteMember(id) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this member?"
    );

  if (!confirmed) {
    return;
  }


  const {
    error
  } = await supabaseClient
    .from("members")
    .delete()
    .eq("id", id);


  if (error) {

    console.error(
      "Delete member error:",
      error
    );

    alert(
      "Unable to delete member:\n\n" +
      error.message
    );

    return;
  }


  alert(
    "Member successfully deleted."
  );


  if (editingId === id) {
    resetForm();
  }


  await loadMembers();
}


// =========================
// SEARCH
// =========================

searchInput.addEventListener(
  "input",
  async () => {

    await loadMembers(
      searchInput.value
    );
  }
);


// =========================
// RESET FORM
// =========================

function resetForm() {

  editingId = null;
  currentPhotoUrl = null;
  selectedPhotoFile = null;

  memberForm.reset();

  status.value = "Active";

  photo.value = "";

  photoPreview.innerHTML = "";

  formTitle.textContent =
    "Add New Member";

  saveButton.textContent =
    "Save Member";

  cancelEditButton.classList.add(
    "hidden"
  );

  formMessage.textContent = "";

  formMessage.classList.add(
    "hidden"
  );
}


// =========================
// FORMAT DATE
// =========================

function formatDate(dateString) {

  if (!dateString) {
    return "-";
  }

  const date =
    new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
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


// =========================
// ESCAPE HTML
// =========================

function escapeHTML(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// =========================
// ESCAPE SEARCH VALUE
// =========================

function escapeSearchValue(value) {

  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/,/g, "\\,")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}


// =========================
// START
// =========================

checkAuth();
