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

const photo =
  document.getElementById("photo");

const photoPreview =
  document.getElementById("photoPreview");

const saveButton =
  document.getElementById("saveButton");

const successMessage =
  document.getElementById("successMessage");

const newRegistrationButton =
  document.getElementById("newRegistrationButton");


// ========================================
// VARIABLES
// ========================================

let selectedPhotoFile = null;


// ========================================
// PHOTO CHANGE
// ========================================

if (photo) {

  photo.addEventListener(
    "change",
    function () {

      const file =
        photo.files[0];

      selectedPhotoFile =
        file || null;


      photoPreview.innerHTML = "";


      if (!file) {
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


      if (file.size > 5 * 1024 * 1024) {

        alert(
          "Photo is too large.\n\n" +
          "Maximum size is 5 MB."
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
              alt="Photo Preview"
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

      await registerMember();

    }
  );

}


// ========================================
// REGISTER MEMBER
// ========================================

async function registerMember() {

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

    // Public registration always starts as Active.
    // Admin can change this later.
    membership_status:
      "Active"

  };


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
    "Submitting...";


  try {

    // ========================================
    // PHOTO
    // ========================================

    let photoUrl = null;


    if (selectedPhotoFile) {

      photoUrl =
        await uploadPhoto(
          selectedPhotoFile
        );

    }


    member.photo_url =
      photoUrl;


    // ========================================
    // INSERT MEMBER
    // ========================================
    //
    // IMPORTANT:
    // Do NOT use .select() here.
    //
    // anon has INSERT permission only.
    //

    const {
      error
    } =
      await supabaseClient

        .from("members")

        .insert([member]);


    if (error) {

      console.error(
        "REGISTRATION ERROR:",
        error
      );

      alert(
        "REGISTRATION FAILED\n\n" +
        error.message
      );

      return;
    }


    // ========================================
    // SUCCESS
    // ========================================

    memberForm.classList.add(
      "hidden"
    );

    successMessage.classList.remove(
      "hidden"
    );


  }

  catch (error) {

    console.error(
      "REGISTRATION ERROR:",
      error
    );

    alert(
      "REGISTRATION ERROR\n\n" +
      error.message
    );

  }

  finally {

    saveButton.disabled = false;

    saveButton.textContent =
      "Submit Registration";

  }

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
      error.message
    );

  }


  console.log(
    "Photo uploaded:",
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
      "Photo uploaded but URL could not be created."
    );

  }


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
// NEW REGISTRATION
// ========================================

if (newRegistrationButton) {

  newRegistrationButton.addEventListener(
    "click",
    function () {

      successMessage.classList.add(
        "hidden"
      );

      memberForm.classList.remove(
        "hidden"
      );

      memberForm.reset();

      photoPreview.innerHTML = "";

      selectedPhotoFile = null;

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

}


console.log(
  "POGA PUBLIC REGISTRATION READY"
);
