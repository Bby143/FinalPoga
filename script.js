const SUPABASE_URL =
  "https://rocvqcqgbdohfwfkhncy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_wStACVHPYgU82oxbsvAWTg_EdkHrQaF";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

const PHOTO_BUCKET = "member-photos";


// =========================
// ELEMENTS
// =========================

const registrationForm =
  document.getElementById("registrationForm");

const registrationSection =
  document.getElementById("registrationSection");

const successMessage =
  document.getElementById("successMessage");

const registerAnotherButton =
  document.getElementById("registerAnotherButton");

const registerButton =
  document.getElementById("registerButton");

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

const photo =
  document.getElementById("photo");

const photoPreview =
  document.getElementById("photoPreview");


// =========================
// PHOTO PREVIEW
// =========================

photo.addEventListener(
  "change",
  function () {

    photoPreview.innerHTML = "";

    const file =
      photo.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {

      alert(
        "Please select an image file."
      );

      photo.value = "";

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {

      alert(
        "Photo must not exceed 5MB."
      );

      photo.value = "";

      return;
    }

    const image =
      document.createElement("img");

    image.className =
      "preview-image";

    image.src =
      URL.createObjectURL(file);

    image.alt =
      "Photo Preview";

    photoPreview.appendChild(image);

  }
);


// =========================
// UPLOAD PHOTO
// =========================

async function uploadPhoto(file) {

  if (!file) {

    throw new Error(
      "Please select a member photo."
    );

  }

  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();

  const randomPart =
    Math.random()
      .toString(36)
      .substring(2, 10);

  const fileName =
    `member_${Date.now()}_${randomPart}.${extension}`;


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
          upsert: false,
          contentType: file.type
        }
      );


  if (uploadError) {

    console.error(
      "Photo upload error:",
      uploadError
    );

    throw new Error(
      "Photo upload failed: " +
      uploadError.message
    );

  }


  const {
    data: publicUrlData
  } =
    supabaseClient
      .storage
      .from(PHOTO_BUCKET)
      .getPublicUrl(
        fileName
      );


  if (
    !publicUrlData ||
    !publicUrlData.publicUrl
  ) {

    throw new Error(
      "Could not get photo URL."
    );

  }


  return publicUrlData.publicUrl;
}


// =========================
// REGISTER MEMBER
// =========================

async function registerMember() {

  registerButton.disabled = true;

  registerButton.textContent =
    "Registering...";


  try {

    const photoFile =
      photo.files[0];


    if (!photoFile) {

      throw new Error(
        "Please select a member photo."
      );

    }


    // Upload photo
    const photoUrl =
      await uploadPhoto(
        photoFile
      );


    // =========================
    // MEMBER DATA
    // =========================

    const memberData = {

      member_id:
        memberId.value.trim(),

      full_name:
        fullName.value.trim(),

      passport_number:
        passportNumber.value.trim(),

      birthday:
        birthday.value,

      // Country where member works abroad
      country_of_work:
        country.value,

      // Address in the Philippines
      address:
        address.value.trim(),

      contact_number:
        contact.value.trim(),

      emergency_contact_person:
        emergencyContact.value.trim(),

      emergency_contact_number:
        emergencyNumber.value.trim(),

      membership_status:
        "Active",

      photo_url:
        photoUrl

    };


    console.log(
      "Submitting member:",
      memberData
    );


    // =========================
    // INSERT
    // =========================

    const {
      error
    } =
      await supabaseClient
        .from("members")
        .insert([
          memberData
        ]);


    if (error) {

      console.error(
        "Registration error:",
        error
      );

      throw new Error(
        error.message
      );

    }


    // =========================
    // SUCCESS
    // =========================

    registrationForm.reset();

    photoPreview.innerHTML = "";

    registrationSection
      .classList.add("hidden");

    successMessage
      .classList.remove("hidden");


  } catch (error) {

    console.error(error);

    alert(
      "Registration failed:\n\n" +
      error.message
    );


  } finally {

    registerButton.disabled = false;

    registerButton.textContent =
      "Register Member";

  }

}


// =========================
// FORM SUBMIT
// =========================

registrationForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    await registerMember();

  }
);


// =========================
// REGISTER ANOTHER MEMBER
// =========================

registerAnotherButton.addEventListener(
  "click",
  function () {

    registrationForm.reset();

    photoPreview.innerHTML = "";

    successMessage
      .classList.add("hidden");

    registrationSection
      .classList.remove("hidden");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);
