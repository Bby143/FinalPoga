let members = [];
let editIndex = -1;
let selectedPhoto = "";

const SUPABASE_URL = "https://rocvqcqgbdohfwfkhncy.supabase.co";
const SUPABASE_KEY = "sb_publishable_wStACVHPYgU82oxbsvAWTg_EdkHrQaF";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const memberForm = document.getElementById("memberForm");
const memberId = document.getElementById("memberId");
const fullName = document.getElementById("fullName");
const passportNumber = document.getElementById("passportNumber");
const address = document.getElementById("address");
const birthday = document.getElementById("birthday");
const contact = document.getElementById("contact");
const emergencyContact = document.getElementById("emergencyContact");
const emergencyNumber = document.getElementById("emergencyNumber");
const status = document.getElementById("status");
const photo = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");
const memberTable = document.getElementById("memberTable");
const search = document.getElementById("search");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const formTitle = document.getElementById("formTitle");
const emptyMessage = document.getElementById("emptyMessage");

memberForm.addEventListener("submit", e => {
  e.preventDefault();
  saveMember();
});

search.addEventListener("input", displayMembers);

photo.addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = e => {
    selectedPhoto = e.target.result;

    photoPreview.innerHTML =
      `<img src="${selectedPhoto}" class="preview-image" alt="Member photo">`;
  };

  reader.readAsDataURL(file);
});

cancelButton.addEventListener("click", resetForm);

async function saveMember() {

  const member = {
    member_id: memberId.value.trim(),
    full_name: fullName.value.trim(),
    passport_number: passportNumber.value.trim(),
    birthday: birthday.value || null,
    address: address.value.trim(),
    contact_number: contact.value.trim(),
    emergency_contact_person: emergencyContact.value.trim(),
    emergency_contact_number: emergencyNumber.value.trim(),
    membership_status: status.value,
    photo_url: selectedPhoto || null
  };

  if (!member.member_id || !member.full_name) {
    alert("Please enter Member ID and Full Name.");
    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  try {

    if (editIndex === -1) {

      // ADD NEW MEMBER
      const { data, error } = await supabaseClient
        .from("members")
        .insert([member])
        .select();

      if (error) {
        console.error(error);

        if (error.code === "23505") {
          alert("This Member ID already exists.");
        } else {
          alert("Registration failed: " + error.message);
        }

        return;
      }

      members.push(member);

      alert("Member registered successfully!");

    } else {

      // UPDATE MEMBER
      const oldMember = members[editIndex];

      const { data, error } = await supabaseClient
        .from("members")
        .update(member)
        .eq("member_id", oldMember.memberId);

      if (error) {
        console.error(error);
        alert("Update failed: " + error.message);
        return;
      }

      members[editIndex] = {
        memberId: member.member_id,
        fullName: member.full_name,
        passportNumber: member.passport_number,
        address: member.address,
        birthday: member.birthday,
        contact: member.contact_number,
        emergencyContact: member.emergency_contact_person,
        emergencyNumber: member.emergency_contact_number,
        status: member.membership_status,
        photo: member.photo_url
      };

      alert("Member updated successfully.");
    }

    saveToLocalStorage();
    resetForm();
    displayMembers();

  } finally {

    saveButton.disabled = false;
    saveButton.textContent =
      editIndex === -1 ? "Add Member" : "Update Member";

  }
}

function displayMembers() {

  memberTable.innerHTML = "";

  const q = search.value.trim().toLowerCase();

  const filtered = members.filter(m =>
    String(m.memberId || "").toLowerCase().includes(q) ||
    String(m.fullName || "").toLowerCase().includes(q) ||
    String(m.passportNumber || "").toLowerCase().includes(q) ||
    String(m.address || "").toLowerCase().includes(q) ||
    String(m.contact || "").toLowerCase().includes(q) ||
    String(m.emergencyContact || "").toLowerCase().includes(q) ||
    String(m.status || "").toLowerCase().includes(q)
  );

  emptyMessage.style.display = filtered.length ? "none" : "block";

  filtered.forEach(member => {

    const index = members.indexOf(member);

    const row = document.createElement("tr");

    const statusClass =
      member.status === "Active"
        ? "status-active"
        : "status-inactive";

    const photoHTML = member.photo
      ? `<img src="${member.photo}" class="member-photo" alt="Member photo">`
      : `<div class="no-photo">No Photo</div>`;

    row.innerHTML = `
      <td>${photoHTML}</td>
      <td>${escapeHTML(member.memberId)}</td>
      <td>${escapeHTML(member.fullName)}</td>
      <td>${escapeHTML(member.passportNumber)}</td>
      <td>${escapeHTML(member.birthday)}</td>
      <td>${escapeHTML(member.contact)}</td>
      <td class="${statusClass}">
        ${escapeHTML(member.status)}
      </td>
      <td>
        <button class="btn-edit"
          onclick="editMember(${index})">
          Edit
        </button>

        <button class="btn-delete"
          onclick="deleteMember(${index})">
          Delete
        </button>
      </td>
    `;

    memberTable.appendChild(row);
  });
}

function editMember(index) {

  const member = members[index];

  memberId.value = member.memberId;
  fullName.value = member.fullName;
  passportNumber.value = member.passportNumber;
  address.value = member.address;
  birthday.value = member.birthday;
  contact.value = member.contact;
  emergencyContact.value = member.emergencyContact;
  emergencyNumber.value = member.emergencyNumber;
  status.value = member.status;

  selectedPhoto = member.photo || "";

  photoPreview.innerHTML = selectedPhoto
    ? `<img src="${selectedPhoto}" class="preview-image" alt="Member photo">`
    : "";

  editIndex = index;

  formTitle.textContent = "Edit Member";
  saveButton.textContent = "Update Member";

  cancelButton.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function deleteMember(index) {

  const member = members[index];

  if (!confirm(`Delete ${member.fullName}?`)) {
    return;
  }

  try {

    const { error } = await supabaseClient
      .from("members")
      .delete()
      .eq("member_id", member.memberId);

    if (error) {
      console.error(error);
      alert("Delete failed: " + error.message);
      return;
    }

    members.splice(index, 1);

    saveToLocalStorage();
    displayMembers();

    alert("Member deleted successfully.");

  } catch (error) {

    console.error(error);
    alert("An unexpected error occurred.");

  }
}

function resetForm() {

  memberForm.reset();

  status.value = "Active";

  editIndex = -1;

  selectedPhoto = "";

  photoPreview.innerHTML = "";

  formTitle.textContent = "Add Member";

  saveButton.textContent = "Add Member";

  cancelButton.classList.add("hidden");
}

function saveToLocalStorage() {

  localStorage.setItem(
    "pogaKsaMembers",
    JSON.stringify(members)
  );
}

function loadMembers() {

  const saved =
    localStorage.getItem("pogaKsaMembers");

  if (saved) {

    try {

      members = JSON.parse(saved);

    } catch {

      members = [];

    }
  }

  displayMembers();
}

function escapeHTML(value) {

  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadMembers();
