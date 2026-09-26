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
// SETTINGS
// ========================================

const PHOTO_BUCKET =
  "member-photos";


// ========================================
// EDIT STATE
// ========================================

let editingId = null;

let currentPhotoUrl = null;

let selectedPhotoFile = null;


// ========================================
// PHOTO SELECTION
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

          photoPreview.innerHTML =
            "";

        }

        return;

      }


      // Check image type

      if (!file.type.startsWith("image/")) {

        alert(
          "Please select an image file."
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
              alt="Selected member photo"
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


// ========================================
// CANCEL BUTTON
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


  const uniqueName =
    "member_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .substring(2, 10) +
    extension;


  const filePath =
    uniqueName;


  console.log(
    "Uploading photo:",
    filePath
  );


  const {
    data,
    error
  } =
    await supabaseClient

      .storage

      .from(PHOTO_BUCKET)

      .upload(
        filePath,
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
      (error.statusCode || "N/A")

    );

  }


  console.log(
    "PHOTO UPLOADED:",
    data
  );


  const {
    data: publicUrlData
  } =
    supabaseClient

      .storage

      .from(PHOTO_BUCKET)

      .getPublicUrl(filePath);


  if (
    !publicUrlData ||
    !publicUrlData.publicUrl
  ) {

    throw new Error(
      "Photo uploaded, but public URL could not be created."
    );

  }


  console.log(
    "PHOTO URL:",
    publicUrlData.publicUrl
  );


  return publicUrlData.publicUrl;

}


// ========================================
// GET FILE EXTENSION
// ========================================

function getFileExtension(filename) {

  const lastDot =
    filename.lastIndexOf(".");


  if (lastDot === -1) {

    return ".jpg";

  }


  return filename
    .substring(lastDot)
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


  saveButton.disabled =
    true;

  saveButton.textContent =
    "Saving...";


  try {

    let photoUrl =
      null;


    // ================================
    // UPLOAD PHOTO FIRST
    // ================================

    if (selectedPhotoFile) {

      photoUrl =
        await uploadPhoto(
          selectedPhotoFile
        );

    }


    // ================================
    // ADD PHOTO URL TO MEMBER
    // ================================

    member.photo_url =
      photoUrl;


    console.log(
      "Saving member:",
      member
    );


    // ================================
    // INSERT MEMBER
    // ================================

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
        "INSERT ERROR:",
        error
      );


      alert(

        "REGISTRATION FAILED\n\n" +

        "Message: " +
        error.message +

        "\n\nCode: " +
        (error.code || "N/A") +

        "\n\nDetails: " +
        (error.details || "N/A") +

        "\n\nHint: " +
        (error.hint || "N/A")

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
      error.message
    );

  }

  finally {

    saveButton.disabled =
      false;

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


  saveButton.disabled =
    true;

  saveButton.textContent =
    "Updating...";


  try {

    let photoUrl =
      currentPhotoUrl;


    // ================================
    // NEW PHOTO SELECTED
    // ================================

    if (selectedPhotoFile) {

      photoUrl =
        await uploadPhoto(
          selectedPhotoFile
        );

    }


    member.photo_url =
      photoUrl;


    console.log(
      "Updating member:",
      editingId
    );


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
        "UPDATE ERROR:",
        error
      );


      alert(

        "UPDATE FAILED\n\n" +

        "Message: " +
        error.message +

        "\n\nCode: " +
        (error.code || "N/A") +

        "\n\nDetails: " +
        (error.details || "N/A") +

        "\n\nHint: " +
        (error.hint || "N/A")

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
      error.message
    );

  }

  finally {

    saveButton.disabled =
      false;

    saveButton.textContent =
      "Add Member";

  }

}


// ========================================
// LOAD MEMBERS
// ========================================

async function loadMembers() {

  memberTable.innerHTML =
    "";

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

      console.error(
        "LOAD ERROR:",
        error
      );


      emptyMessage.textContent =
        "Unable to load members.";


      alert(

        "LOAD MEMBERS FAILED\n\n" +

        "Message: " +
        error.message +

        "\n\nCode: " +
        (error.code || "N/A") +

        "\n\nDetails: " +
        (error.details || "N/A") +

        "\n\nHint: " +
        (error.hint || "N/A")

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

  memberTable.innerHTML =
    "";


  data.forEach(
    function (member) {

      const row =
        document.createElement("tr");


      const statusClass =
        member.membership_status === "Active"
          ? "status-active"
          : "status-inactive";


      row.innerHTML = `

        <td>

          ${
            member.photo_url

              ? `

                <img
                  src="${escapeHTML(
                    member.photo_url
                  )}"
                  class="member-photo"
                  alt="Member photo"
                >

              `

              : `

                <div class="no-photo">
                  No Photo
                </div>

              `
          }

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
// EDIT / DELETE BUTTONS
// ========================================

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


    if (action === "edit") {

      await editMember(id);

    }


    if (action === "delete") {

      await deleteMember(
        id,
        button.dataset.name
      );

    }

  }
);


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
      data.membership_status ||
      "Active";


    // ================================
    // SAVE CURRENT PHOTO
    // ================================

    currentPhotoUrl =
      data.photo_url || null;


    selectedPhotoFile =
      null;


    if (photo) {

      photo.value =
        "";

    }


    // ================================
    // SHOW CURRENT PHOTO
    // ================================

    if (currentPhotoUrl) {

      showPhotoPreview(
        currentPhotoUrl
      );

    } else {

      photoPreview.innerHTML =
        "";

    }


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
      name +

      "\n\nThis action cannot be undone."

    );


  if (!confirmed) {

    return;

  }


  try {

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


// ========================================
// PHOTO PREVIEW
// ========================================

function showPhotoPreview(
  imageUrl
) {

  if (!imageUrl) {

    photoPreview.innerHTML =
      "";

    return;

  }


  photoPreview.innerHTML = `

    <img
      src="${escapeHTML(imageUrl)}"
      class="preview-image"
      alt="Member photo"
    >

  `;

}


// ========================================
// RESET FORM
// ========================================

function resetForm() {

  memberForm.reset();


  editingId =
    null;


  currentPhotoUrl =
    null;


  selectedPhotoFile =
    null;


  photoPreview.innerHTML =
    "";


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


// ========================================
// SEARCH
// ========================================

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
);


// ========================================
// ERROR HANDLER
// ========================================

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
// START SYSTEM
// ========================================

loadMembers();
