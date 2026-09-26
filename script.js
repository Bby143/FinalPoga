const SUPABASE_URL =
  "https://rocvqcqgbdohfwfkhncy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_wStACVHPYgU82oxbsvAWTg_EdkHrQaF";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ================================
// ELEMENTS
// ================================

const memberForm = document.getElementById("memberForm");
const memberId = document.getElementById("memberId");
const fullName = document.getElementById("fullName");
const passportNumber = document.getElementById("passportNumber");
const birthday = document.getElementById("birthday");
const address = document.getElementById("address");
const contact = document.getElementById("contact");
const emergencyContact = document.getElementById("emergencyContact");
const emergencyNumber = document.getElementById("emergencyNumber");
const status = document.getElementById("status");
const memberTable = document.getElementById("memberTable");
const search = document.getElementById("search");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const formTitle = document.getElementById("formTitle");
const emptyMessage = document.getElementById("emptyMessage");


// ================================
// EDIT STATE
// ================================

let editingId = null;


// ================================
// FORM SUBMIT
// ================================

memberForm.addEventListener("submit", async function (event) {

  event.preventDefault();

  if (editingId === null) {

    await addMember();

  } else {

    await updateMember();

  }

});


// ================================
// ADD MEMBER
// ================================

async function addMember() {

  const member = getFormData();

  if (!member.member_id || !member.full_name) {

    alert("Please enter Member ID and Full Name.");

    return;

  }

  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  try {

    const { error } =
      await supabaseClient
        .from("members")
        .insert([member]);

    if (error) {

      showSupabaseError(
        "REGISTRATION FAILED",
        error
      );

      return;

    }

    alert("Member registered successfully!");

    resetForm();

    await loadMembers();

  }

  catch (error) {

    alert(
      "ERROR\n\n" +
      error.message
    );

  }

  finally {

    saveButton.disabled = false;

    if (editingId === null) {
      saveButton.textContent = "Add Member";
    }

  }

}


// ================================
// UPDATE MEMBER
// ================================

async function updateMember() {

  const member = getFormData();

  if (!member.member_id || !member.full_name) {

    alert("Please enter Member ID and Full Name.");

    return;

  }

  saveButton.disabled = true;
  saveButton.textContent = "Updating...";

  try {

    console.log(
      "Updating member ID:",
      editingId
    );

    console.log(
      "New data:",
      member
    );


    const { data, error } =
      await supabaseClient
        .from("members")
        .update(member)
        .eq("id", editingId)
        .select();

    if (error) {

      showSupabaseError(
        "UPDATE FAILED",
        error
      );

      return;

    }

    console.log(
      "UPDATE RESULT:",
      data
    );


    alert(
      "Member updated successfully!"
    );

    resetForm();

    await loadMembers();

  }

  catch (error) {

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


// ================================
// DELETE MEMBER
// ================================

async function deleteMember(id, name) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this member?\n\n" +
      name
    );

  if (!confirmed) {

    return;

  }


  console.log(
    "Deleting member ID:",
    id
  );


  try {

    const { error } =
      await supabaseClient
        .from("members")
        .delete()
        .eq("id", id);

    if (error) {

      showSupabaseError(
        "DELETE FAILED",
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

    alert(
      "DELETE ERROR\n\n" +
      error.message
    );

  }

}


// ================================
// GET FORM DATA
// ================================

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
      status.value || "Active",

    photo_url:
      null

  };

}


// ================================
// LOAD MEMBERS
// ================================

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
        .order("id", {
          ascending: false
        });


    if (error) {

      showSupabaseError(
        "LOAD FAILED",
        error
      );

      return;

    }


    if (!data || data.length === 0) {

      emptyMessage.textContent =
        "No member records found.";

      return;

    }


    emptyMessage.style.display =
      "none";


    displayMembers(data);

  }

  catch (error) {

    alert(
      "LOAD ERROR\n\n" +
      error.message
    );

  }

}


// ================================
// DISPLAY MEMBERS
// ================================

function displayMembers(data) {

  memberTable.innerHTML = "";


  data.forEach(function (member) {

    const row =
      document.createElement("tr");


    row.innerHTML = `

      <td>
        ${
          member.photo_url
            ? `<img
                 src="${escapeHTML(member.photo_url)}"
                 class="member-photo"
                 alt="Member photo"
               >`
            : `<div class="no-photo">
                 No Photo
               </div>`
        }
      </td>

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
        ${escapeHTML(member.birthday || "")}
      </td>

      <td>
        ${escapeHTML(member.contact_number || "")}
      </td>

      <td>
        ${escapeHTML(member.membership_status || "")}
      </td>

      <td>

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
          data-name="${escapeHTML(member.full_name || "")}"
        >
          Delete
        </button>

      </td>

    `;


    memberTable.appendChild(row);

  });

}


// ================================
// TABLE BUTTON HANDLER
// ================================

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
      Number(button.dataset.id);


    console.log(
      "BUTTON CLICKED:",
      action,
      id
    );


    if (action === "edit") {

      await editMember(id);

    }


    if (action === "delete") {

      const name =
        button.dataset.name || "this member";

      await deleteMember(
        id,
        name
      );

    }

  }
);


// ================================
// EDIT MEMBER
// ================================

async function editMember(id) {

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

      showSupabaseError(
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
      data.membership_status || "Active";


    editingId =
      data.id;


    formTitle.textContent =
      "Edit Member";

    saveButton.textContent =
      "Update Member";


    if (cancelButton) {

      cancelButton.classList.remove(
        "hidden"
      );

    }


    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  }

  catch (error) {

    alert(
      "EDIT ERROR\n\n" +
      error.message
    );

  }

}


// ================================
// CANCEL EDIT
// ================================

if (cancelButton) {

  cancelButton.addEventListener(
    "click",
    function () {

      resetForm();

    }
  );

}


// ================================
// RESET FORM
// ================================

function resetForm() {

  memberForm.reset();

  editingId = null;

  formTitle.textContent =
    "Add Member";

  saveButton.textContent =
    "Add Member";


  if (cancelButton) {

    cancelButton.classList.add(
      "hidden"
    );

  }

}


// ================================
// SEARCH
// ================================

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

      showSupabaseError(
        "SEARCH FAILED",
        error
      );

      return;

    }


    if (!data || data.length === 0) {

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
);


// ================================
// ERROR DISPLAY
// ================================

function showSupabaseError(
  title,
  error
) {

  console.error(
    title,
    error
  );


  alert(

    title +

    "\n\n" +

    "Message: " +
    (error.message || "N/A") +

    "\n\nCode: " +
    (error.code || "N/A") +

    "\n\nDetails: " +
    (error.details || "N/A") +

    "\n\nHint: " +
    (error.hint || "N/A")

  );

}


// ================================
// ESCAPE HTML
// ================================

function escapeHTML(value) {

  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


// ================================
// START
// ================================

loadMembers();
