// ============================================
// POGA KSA - SUPABASE TEST VERSION
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

console.log("POGA KSA SCRIPT LOADED");


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

const address =
  document.getElementById("address");

const birthday =
  document.getElementById("birthday");

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
// FORM
// ============================================

memberForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    await saveMember();

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
    "Trying to insert:",
    member
  );


  try {

    const {
      data,
      error
    } = await supabaseClient

      .from("members")

      .insert([member])

      .select()
      
      .single();


    // ========================================
    // ERROR
    // ========================================

    if (error) {

      console.error(
        "SUPABASE ERROR:",
        error
      );


      alert(

        "SUPABASE INSERT FAILED\n\n" +

        "Message:\n" +
        error.message +

        "\n\nCode:\n" +
        (error.code || "N/A") +

        "\n\nDetails:\n" +
        (error.details || "N/A") +

        "\n\nHint:\n" +
        (error.hint || "N/A")

      );


      // IMPORTANT:
      // DO NOT CLEAR FORM

      return;

    }


    // ========================================
    // SUCCESS
    // ========================================

    console.log(
      "SUCCESS!",
      data
    );


    alert(
      "SUCCESS! Member saved to Supabase."
    );


    // Clear ONLY after successful insert

    memberForm.reset();


    if (photoPreview) {
      photoPreview.innerHTML = "";
    }


  }

  catch (error) {

    console.error(
      "JAVASCRIPT ERROR:",
      error
    );


    alert(

      "JAVASCRIPT ERROR\n\n" +

      error.message

    );

  }

  finally {

    saveButton.disabled = false;

    saveButton.textContent =
      "Add Member";

  }

}
