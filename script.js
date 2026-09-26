// ============================================
// POGA KSA MEMBER REGISTRATION
// SUPABASE INSERT TEST
// ============================================

const SUPABASE_URL =
  "https://rocvqcqgbdohfwfkhncy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_wStACVHPYgU82oxbsvAWTg_EdkHrQaF";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ============================================
// ELEMENTS
// ============================================

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

const saveButton =
  document.getElementById("saveButton");


// ============================================
// FORM SUBMIT
// ============================================

memberForm.addEventListener(
  "submit",
  function (event) {

    event.preventDefault();

    saveMember();

  }
);


// ============================================
// PHOTO PREVIEW
// ============================================

photo.addEventListener(
  "change",
  function (event) {

    const file =
      event.target.files[0];

    if (!file) {

      photoPreview.innerHTML = "";

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
            alt="Member photo"
          >

        `;

      };


    reader.readAsDataURL(file);

  }
);


// ============================================
// SAVE MEMBER
// ============================================

async function saveMember() {

  const member = {

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


  // ==========================================
  // VALIDATION
  // ==========================================

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

  saveButton.textContent =
    "Saving...";


  console.log(
    "MEMBER BEING SENT:",
    member
  );


  try {

    // ========================================
    // INSERT ONLY
    // ========================================

    const { error } =
      await supabaseClient

        .from("members")

        .insert([member]);


    // ========================================
    // ERROR
    // ========================================

    if (error) {

      console.error(
        "SUPABASE INSERT ERROR:",
        error
      );


      alert(

        "REGISTRATION FAILED\n\n" +

        "Message:\n" +
        (error.message || "N/A") +

        "\n\nCode:\n" +
        (error.code || "N/A") +

        "\n\nDetails:\n" +
        (error.details || "N/A") +

        "\n\nHint:\n" +
        (error.hint || "N/A")

      );


      // DO NOT CLEAR THE FORM

      return;

    }


    // ========================================
    // SUCCESS
    // ========================================

    console.log(
      "MEMBER SAVED SUCCESSFULLY"
    );


    alert(
      "SUCCESS! Member has been saved."
    );


    // Clear ONLY after successful INSERT

    memberForm.reset();


    photoPreview.innerHTML = "";


  }

  catch (error) {

    console.error(
      "JAVASCRIPT ERROR:",
      error
    );


    alert(

      "JAVASCRIPT ERROR\n\n" +

      (error.message || error)

    );

  }


  finally {

    saveButton.disabled = false;

    saveButton.textContent =
      "Add Member";

  }

      }
