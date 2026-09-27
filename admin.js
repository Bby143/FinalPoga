const SUPABASE_URL = "https://rocvqcqgbdohfwfkhncy.supabase.co";
const SUPABASE_KEY = "sb_publishable_wStACVHPYgU82oxbsvAWTg_EdkHrQaF";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const PHOTO_BUCKET = "member-photos";

// =========================
// LOGIN ELEMENTS
// =========================

const loginSection = document.getElementById("loginSection");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginButton = document.getElementById("loginButton");
const loginError = document.getElementById("loginError");

// =========================
// DASHBOARD ELEMENTS
// =========================

const dashboardSection = document.getElementById("dashboardSection");
const adminEmail = document.getElementById("adminEmail");
const logoutButton = document.getElementById("logoutButton");

// =========================
// FORM ELEMENTS
// =========================

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

// =========================
// RECORDS ELEMENTS
// =========================

const searchInput = document.getElementById("searchInput");
const membersTableBody = document.getElementById("membersTableBody");

// =========================
// DETAILS MODAL ELEMENTS
// =========================

const memberDetailsModal = document.getElementById("memberDetailsModal");
const closeDetailsButton = document.getElementById("closeDetailsButton");

const detailsPhoto = document.getElementById("detailsPhoto");
const detailsMemberId = document.getElementById("detailsMemberId");
const detailsFullName = document.getElementById("detailsFullName");
const detailsPassport = document.getElementById("detailsPassport");
const detailsBirthday = document.getElementById("detailsBirthday");
const detailsCountry = document.getElementById("detailsCountry");
const detailsContact = document.getElementById("detailsContact");
const detailsAddress = document.getElementById("detailsAddress");
const detailsEmergencyPerson = document.getElementById(
  "detailsEmergencyPerson"
);
const detailsEmergencyNumber = document.getElementById(
  "detailsEmergencyNumber"
);
const detailsStatus = document.getElementById("detailsStatus");

const detailsEditButton = document.getElementById("detailsEditButton");
const detailsCloseButton = document.getElementById("detailsCloseButton");

// =========================
// VARIABLES
// =========================

let editingId = null;
let currentPhotoUrl = null;
let selectedPhotoFile = null;
let currentDetailsMemberId = null;

// =========================
// AUTHENTICATION
// =========================

async function checkAuth() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (session) {
    showDashboard(session.user);
  } else {
    showLogin();
  }
}

function showLogin() {
  loginSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");

  if (adminEmail) {
    adminEmail.textContent = "";
  }
}

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

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  loginError.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  loginButton.disabled = false;
  loginButton.textContent = "Login";

  if (error) {
    loginError.textContent = error.message;
    return;
  }

  if (data.session) {
    await showDashboard(data.user);
  }
});

// =========================
// LOGOUT
// =========================

logoutButton.addEventListener("click", async function () {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("Logout failed: " + error.message);
    return;
  }

  showLogin();
});

// =========================
// AUTH STATE
// =========================

supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if (event === "SIGNED_IN" && session) {
    await showDashboard(session.user);
  }

  if (event === "SIGNED_OUT") {
    showLogin();
  }
});

// =========================
// PHOTO VALIDATION
// =========================

photo.addEventListener("change", function () {
  const file = photo.files[0];

  selectedPhotoFile = null;

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    photo.value = "";
    return;
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    alert("Photo must be 5MB or smaller.");
    photo.value = "";
    return;
  }

  selectedPhotoFile = file;
  showPhotoPreview(file);
});

// =========================
// PHOTO PREVIEW
// =========================

function showPhotoPreview(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
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

  const extension = file.name.split(".").pop().toLowerCase();

  const safeExtension =
    extension === "jpeg" ? "jpg" : extension;

  const fileName =
    "member_" +
    Date.now() +
    "_" +
    Math.random().toString(36).substring(2, 10) +
    "." +
    safeExtension;

  const { error: uploadError } = await supabaseClient.storage
    .from(PHOTO_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabaseClient.storage
    .from(PHOTO_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// =========================
// FORM DATA
// =========================

function getFormData(photoUrl = null) {
  return {
    member_id: memberId.value.trim(),
    full_name: fullName.value.trim(),
    passport_number: passportNumber.value.trim(),
    birthday: birthday.value,
    country_of_work: country.value || null,
    address: address.value.trim(),
    contact_number: contact.value.trim(),
    emergency_contact_person: emergencyContact.value.trim(),
    emergency_contact_number: emergencyNumber.value.trim(),
    membership_status: status.value,
    photo_url: photoUrl,
  };
}

// =========================
// ADD / UPDATE MEMBER
// =========================

memberForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  saveButton.disabled = true;
  saveButton.textContent = editingId
    ? "Updating..."
    : "Saving...";

  try {
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

      const photoUrl = await uploadPhoto(selectedPhotoFile);

      const memberData = getFormData(photoUrl);

      const { error } = await supabaseClient
        .from("members")
        .insert([memberData]);

      if (error) {
        throw error;
      }

      alert("Member added successfully.");

      resetForm();
      await loadMembers();
    }

    // =========================
    // UPDATE MEMBER
    // =========================

    else {
      let photoUrl = currentPhotoUrl;

      if (selectedPhotoFile) {
        photoUrl = await uploadPhoto(selectedPhotoFile);
      }

      const memberData = getFormData(photoUrl);

      const { error } = await supabaseClient
        .from("members")
        .update(memberData)
        .eq("id", editingId);

      if (error) {
        throw error;
      }

      alert("Member updated successfully.");

      resetForm();
      await loadMembers();
    }
  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  }

  saveButton.disabled = false;
  saveButton.textContent = "Save Member";
});

// =========================
// LOAD MEMBERS
// =========================

async function loadMembers() {
  const { data, error } = await supabaseClient
    .from("members")
    .select("*");

  if (error) {
    console.error(error);
    alert("Unable to load members: " + error.message);
    return;
  }

  /*
    IMPORTANT:
    Member ID is stored as TEXT.

    Example:
    001
    002
    003
    010
    011
    100

    We convert the Member ID to a number
    ONLY for sorting.

    This keeps the displayed value exactly as
    001, 002, 003, etc.
  */

  data.sort((a, b) => {
    const numberA = parseInt(a.member_id, 10);
    const numberB = parseInt(b.member_id, 10);

    // Normal numeric sorting
    if (!Number.isNaN(numberA) && !Number.isNaN(numberB)) {
      return numberA - numberB;
    }

    // Fallback if a Member ID is not numeric
    return String(a.member_id || "").localeCompare(
      String(b.member_id || ""),
      undefined,
      {
        numeric: true,
        sensitivity: "base",
      }
    );
  });

  displayMembers(data);
}

// =========================
// DISPLAY MEMBERS
// =========================

function displayMembers(members) {
  membersTableBody.innerHTML = "";

  if (!members || members.length === 0) {
    membersTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty">
          No members found.
        </td>
      </tr>
    `;
    return;
  }

  members.forEach((member) => {
    const row = document.createElement("tr");

    const photoCell = member.photo_url
      ? `
        <img
          src="${escapeHTML(member.photo_url)}"
          alt="Member Photo"
          class="member-photo"
        >
      `
      : `
        <div class="no-photo">
          No Photo
        </div>
      `;

    row.innerHTML = `
      <td>${photoCell}</td>

      <td>
        ${escapeHTML(member.member_id || "")}
      </td>

      <td>
        ${escapeHTML(member.full_name || "")}
      </td>

      <td>
        ${escapeHTML(member.passport_number || "")}
      </td>

      <td>
        ${formatDate(member.birthday)}
      </td>

      <td>
        ${escapeHTML(member.contact_number || "")}
      </td>

      <td>
        <span class="status">
          ${escapeHTML(member.membership_status || "")}
        </span>
      </td>

      <td>
        <div class="action-buttons">

          <button
            type="button"
            class="view-button"
            onclick="viewMemberDetails(${member.id})"
          >
            View Details
          </button>

          <button
            type="button"
            class="edit-button"
            onclick="editMember(${member.id})"
          >
            Edit
          </button>

          <button
            type="button"
            class="delete-button"
            onclick="deleteMember(${member.id})"
          >
            Delete
          </button>

        </div>
      </td>
    `;

    membersTableBody.appendChild(row);
  });
}

// =========================
// VIEW MEMBER DETAILS
// =========================

async function viewMemberDetails(id) {
  const { data: member, error } = await supabaseClient
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert("Unable to load member details: " + error.message);
    return;
  }

  currentDetailsMemberId = member.id;

  if (member.photo_url) {
    detailsPhoto.innerHTML = `
      <img
        src="${escapeHTML(member.photo_url)}"
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

  detailsContact.textContent =
    member.contact_number || "-";

  detailsAddress.textContent =
    member.address || "-";

  detailsEmergencyPerson.textContent =
    member.emergency_contact_person || "-";

  detailsEmergencyNumber.textContent =
    member.emergency_contact_number || "-";

  detailsStatus.textContent =
    member.membership_status || "-";

  memberDetailsModal.classList.remove("hidden");
}

// =========================
// EDIT FROM DETAILS
// =========================

detailsEditButton.addEventListener("click", async function () {
  if (!currentDetailsMemberId) {
    return;
  }

  closeMemberDetails();

  await editMember(currentDetailsMemberId);
});

// =========================
// CLOSE DETAILS MODAL
// =========================

function closeMemberDetails() {
  memberDetailsModal.classList.add("hidden");
  currentDetailsMemberId = null;
}

closeDetailsButton.addEventListener(
  "click",
  closeMemberDetails
);

detailsCloseButton.addEventListener(
  "click",
  closeMemberDetails
);

// Close when clicking outside modal
memberDetailsModal.addEventListener(
  "click",
  function (event) {
    if (event.target === memberDetailsModal) {
      closeMemberDetails();
    }
  }
);

// Close with ESC key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeMemberDetails();
  }
});

// =========================
// EDIT MEMBER
// =========================

async function editMember(id) {
  const { data: member, error } = await supabaseClient
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert("Unable to load member: " + error.message);
    return;
  }

  editingId = member.id;

  formTitle.textContent = "Edit Member";

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

  currentPhotoUrl =
    member.photo_url || null;

  selectedPhotoFile = null;

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
    photoPreview.innerHTML = `
      <div class="no-photo">
        No Photo
      </div>
    `;
  }

  saveButton.textContent = "Update Member";
  cancelEditButton.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// =========================
// CANCEL EDIT
// =========================

cancelEditButton.addEventListener(
  "click",
  function () {
    resetForm();
  }
);

// =========================
// DELETE MEMBER
// =========================

async function deleteMember(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this member?"
  );

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient
    .from("members")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Unable to delete member: " + error.message);
    return;
  }

  alert("Member deleted successfully.");

  await loadMembers();
}

// =========================
// SEARCH MEMBERS
// =========================

searchInput.addEventListener(
  "input",
  async function () {
    const searchValue =
      searchInput.value.trim();

    if (!searchValue) {
      await loadMembers();
      return;
    }

    const safeSearch =
      escapeSearchValue(searchValue);

    const { data, error } = await supabaseClient
      .from("members")
      .select("*")
      .or(
        `member_id.ilike.%${safeSearch}%,full_name.ilike.%${safeSearch}%,passport_number.ilike.%${safeSearch}%,contact_number.ilike.%${safeSearch}%`
      );

    if (error) {
      console.error(error);
      return;
    }

    /*
      Keep search results in the same
      ascending Member ID order.
    */

    data.sort((a, b) => {
      const numberA = parseInt(a.member_id, 10);
      const numberB = parseInt(b.member_id, 10);

      if (!Number.isNaN(numberA) && !Number.isNaN(numberB)) {
        return numberA - numberB;
      }

      return String(a.member_id || "").localeCompare(
        String(b.member_id || ""),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        }
      );
    });

    displayMembers(data);
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

  formTitle.textContent = "Add Member";

  saveButton.textContent = "Save Member";

  cancelEditButton.classList.add("hidden");

  photoPreview.innerHTML = "";

  photo.value = "";

  currentDetailsMemberId = null;
}

// =========================
// FORMAT DATE
// =========================

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

// =========================
// HTML ESCAPE
// =========================

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =========================
// SEARCH ESCAPE
// =========================

function escapeSearchValue(value) {
  return String(value ?? "")
    .replace(/[%_]/g, "\\$&")
    .replace(/,/g, "\\,")
    .replace(/\./g, "\\.");
}

// =========================
// INITIAL AUTH CHECK
// =========================

checkAuth();
