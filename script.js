let members = [];
let editIndex = -1;
let selectedPhoto = "";

const SUPABASE_URL = "https://rocvqcqgbdohfwfkhncy.supabase.co";
const SUPABASE_KEY = "sb_publishable_wStACVHPYgU82oxbsvAWTg_EdkHrQaF";

const supabaseClient = window.supabase.createClient(
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


// ================================
// FORM SUBMIT
// ================================

memberForm.addEventListener("submit", function (e) {
  e.preventDefault();
  saveMember();
});


// ================================
// SEARCH
// ================================

search.addEventListener("input", displayMembers);


// ================================
// PHOTO
// ================================

photo.addEventListener("change", function (event) {

  const file = event.target.files[0];

  if (!file) {
    selectedPhoto = "";
    photoPreview.innerHTML = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {

    selectedPhoto = e.target.result;

    photoPreview.innerHTML = `
      <img
        src="${selectedPhoto}"
        class="preview-image"
        alt="Member photo"
      >
    `;
  };

  reader.readAsDataURL(file);
});


// ================================
// CANCEL
// ================================

cancelButton.addEventListener("click", resetForm);


// ================================
// SAVE MEMBER
// ADD / UPDATE
// ================================

async function saveMember() {

  const member = {

    member_id: memberId.value.trim(),

    full_name: fullName.value.trim(),

    passport_number: passportNumber.value.trim(),

    birthday: birthday.value || null,

    address: address.value.trim(),

    contact_number: contact.value.trim(),

    emergency_contact_person:
      emergencyContact.value.trim(),

    emergency_contact_number:
      emergencyNumber.value.trim(),

    membership_status:
      status.value || "Active",

    photo_url:
      selectedPhoto || null
  };


  // ================================
  // VALIDATION
  // ================================

  if (!member.member_id || !member.full_name) {

    alert(
      "Please enter Member ID and Full Name."
    );

    return;
  }


  saveButton.disabled = true;

  saveButton.textContent = "Saving...";


  try {

    // ================================
    // ADD NEW MEMBER
    // ================================

    if (editIndex === -1) {

      const { data, error } =
        await supabaseClient
          .from("members")
          .insert([member])
          .select()
          .single();


      if (error) {

        console.error(
          "INSERT ERROR:",
          error
        );

        if (error.code === "23505") {

          alert(
            "This Member ID already exists."
          );

        } else {

          alert(
            "Registration failed: " +
            error.message
          );
        }

        return;
      }


      console.log(
        "MEMBER INSERTED:",
        data
      );


      members.unshift(
        convertMember(data)
      );


      alert(
        "Member registered successfully!"
      );
    }


    // ================================
    // UPDATE MEMBER
    // ================================

    else {

      const oldMember =
        members[editIndex];


      const { data, error } =
        await supabaseClient

          .from("members")

          .update(member)

          .eq(
            "member_id",
            oldMember.memberId
          )

          .select()

          .single();


      if (error) {

        console.error(
          "UPDATE ERROR:",
          error
        );

        alert(
          "Update failed: " +
          error.message
        );

        return;
      }


      members[editIndex] =
        convertMember(data);


      alert(
        "Member updated successfully."
      );
    }


    resetForm();

    displayMembers();

  }

  catch (error) {

    console.error(
      "UNEXPECTED ERROR:",
      error
    );

    alert(
      "An unexpected error occurred: " +
      error.message
    );

  }

  finally {

    saveButton.disabled = false;

    saveButton.textContent =
      editIndex === -1
        ? "Add Member"
        : "Update Member";
  }
}


// ================================
// CONVERT DATABASE MEMBER
// ================================

function convertMember(data) {

  return {

    id:
      data.id || null,

    memberId:
      data.member_id || "",

    fullName:
      data.full_name || "",

    passportNumber:
      data.passport_number || "",

    address:
      data.address || "",

    birthday:
      data.birthday || "",

    contact:
      data.contact_number || "",

    emergencyContact:
      data.emergency_contact_person || "",

    emergencyNumber:
      data.emergency_contact_number || "",

    status:
      data.membership_status || "Active",

    photo:
      data.photo_url || ""
  };
}


// ================================
// LOAD MEMBERS FROM SUPABASE
// ================================

async function loadMembers() {

  memberTable.innerHTML = "";

  emptyMessage.textContent =
    "Loading members...";

  emptyMessage.style.display =
    "block";


  try {

    const { data, error } =
      await supabaseClient

        .from("members")

        .select("*")

        .order("id", {
          ascending: false
        });


    if (error) {

      console.error(
        "LOAD ERROR:",
        error
      );

      emptyMessage.textContent =
        "Unable to load members.";

      alert(
        "Could not load members: " +
        error.message
      );

      return;
    }


    members =
      (data || []).map(
        convertMember
      );


    displayMembers();

  }

  catch (error) {

    console.error(
      "LOAD ERROR:",
      error
    );

    emptyMessage.textContent =
      "Unable to load members.";
  }
}


// ================================
// DISPLAY MEMBERS
// ================================

function displayMembers() {

  memberTable.innerHTML = "";

  const q =
    search.value
      .trim()
      .toLowerCase();


  const filtered =
    members.filter(member => {

      return (

        String(
          member.memberId || ""
        )
          .toLowerCase()
          .includes(q)

        ||

        String(
          member.fullName || ""
        )
          .toLowerCase()
          .includes(q)

        ||

        String(
          member.passportNumber || ""
        )
          .toLowerCase()
          .includes(q)

        ||

        String(
          member.address || ""
        )
          .toLowerCase()
          .includes(q)

        ||

        String(
          member.contact || ""
        )
          .toLowerCase()
          .includes(q)

        ||

        String(
          member.emergencyContact || ""
        )
          .toLowerCase()
          .includes(q)

        ||

        String(
          member.status || ""
        )
          .toLowerCase()
          .includes(q)
      );
    });


  emptyMessage.style.display =
    filtered.length
      ? "none"
      : "block";


  filtered.forEach(member => {

    const index =
      members.indexOf(member);


    const row =
      document.createElement("tr");


    const statusClass =
      member.status === "Active"
        ? "status-active"
        : "status-inactive";


    const photoHTML =
      member.photo

        ? `
          <img
            src="${escapeHTML(member.photo)}"
            class="member-photo"
            alt="Member photo"
          >
        `

        : `
          <div class="no-photo">
            No Photo
          </div>
        `;


    row.innerHTML = `

      <td>
        ${photoHTML}
      </td>

      <td>
        ${escapeHTML(member.memberId)}
      </td>

      <td>
        ${escapeHTML(member.fullName)}
      </td>

      <td>
        ${escapeHTML(member.passportNumber)}
      </td>

      <td>
        ${escapeHTML(member.birthday)}
      </td>

      <td>
        ${escapeHTML(member.contact)}
      </td>

      <td class="${statusClass}">
        ${escapeHTML(member.status)}
      </td>

      <td>

        <button
          class="btn-edit"
          onclick="editMember(${index})"
        >
          Edit
        </button>

        <button
          class="btn-delete"
          onclick="deleteMember(${index})"
        >
          Delete
        </button>

      </td>
    `;


    memberTable.appendChild(row);
  });
}


// ================================
// EDIT MEMBER
// ================================

function editMember(index) {

  const member =
    members[index];


  if (!member) {
    return;
  }


  memberId.value =
    member.memberId;

  fullName.value =
    member.fullName;

  passportNumber.value =
    member.passportNumber;

  address.value =
    member.address;

  birthday.value =
    member.birthday;

  contact.value =
    member.contact;

  emergencyContact.value =
    member.emergencyContact;

  emergencyNumber.value =
    member.emergencyNumber;

  status.value =
    member.status;


  selectedPhoto =
    member.photo || "";


  photoPreview.innerHTML =
    selectedPhoto

      ? `
        <img
          src="${escapeHTML(selectedPhoto)}"
          class="preview-image"
          alt="Member photo"
        >
      `

      : "";


  editIndex = index;


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


// ================================
// DELETE MEMBER
// ================================

async function deleteMember(index) {

  const member =
    members[index];


  if (!member) {
    return;
