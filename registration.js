// ========================================
// POGA KSA MEMBER REGISTRATION
// ========================================

// Supabase
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
const MEMBERS_TABLE = "members";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ========================================
// ELEMENTS
// ========================================

const registrationForm =
  document.getElementById("registrationForm");

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

const submitButton =
  document.getElementById("submitButton");

const successMessage =
  document.getElementById("successMessage");

const errorMessage =
  document.getElementById("errorMessage");

const registerAnotherButton =
  document.getElementById(
    "registerAnotherButton"
  );

// ========================================
// PHOTO PREVIEW
// ========================================

photo.addEventListener("change", function () {

  photoPreview.innerHTML = "";

  const file = photo.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {

    showError(
      "Please select a valid image file."
    );

    photo.value = "";

    return;
  }

  if (file.size > MAX_FILE_SIZE) {

    showError(
      "Photo is too large. Maximum file size is 5MB."
    );

    photo.value = "";

    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {

    const img =
      document.createElement("img");

    img.src = event.target.result;

    img.alt = "Photo Preview";

    photoPreview.appendChild(img);
  };

  reader.readAsDataURL(file);

});

// ========================================
// FORM SUBMIT
// ========================================

registrationForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    hideMessages();

    // ------------------------------
    // VALIDATION
    // ------------------------------

    const memberIdValue =
      memberId.value.trim();

    const fullNameValue =
      fullName.value.trim();

    if (!memberIdValue) {

      showError(
        "Please enter the Member ID."
      );

      memberId.focus();

      return;
    }

    if (!fullNameValue) {

      showError(
        "Please enter the Full Name."
      );

      fullName.focus();

      return;
    }

    // ------------------------------
    // PHOTO
    // ------------------------------

    let photoUrl = null;

    const photoFile = photo.files[0];

    submitButton.disabled = true;

    submitButton.textContent =
      "Submitting...";

    try {

      // ========================================
      // UPLOAD PHOTO
      // ========================================

      if (photoFile) {

        if (
          !photoFile.type.startsWith("image/")
        ) {

          throw new Error(
            "Please select a valid image file."
          );
        }

        if (
          photoFile.size > MAX_FILE_SIZE
        ) {

          throw new Error(
            "Photo is too large. Maximum file size is 5MB."
          );
        }

        const fileExtension =
          photoFile.name
            .split(".")
            .pop()
            .toLowerCase();

        const safeMemberId =
          memberIdValue
            .replace(/[^a-zA-Z0-9-_]/g, "");

        const fileName =
          `${safeMemberId}_${Date.now()}.${fileExtension}`;

        const filePath =
          `registrations/${fileName}`;

        const {
          error: uploadError
        } = await supabaseClient
          .storage
          .from(PHOTO_BUCKET)
          .upload(
            filePath,
            photoFile,
            {
              cacheControl: "3600",
              upsert: false
            }
          );

        if (uploadError) {

          throw uploadError;
        }

        // ========================================
        // GET PUBLIC PHOTO URL
        // ========================================

        const {
          data: publicUrlData
        } = supabaseClient
          .storage
          .from(PHOTO_BUCKET)
          .getPublicUrl(filePath);

        photoUrl =
          publicUrlData.publicUrl;
      }

      // ========================================
      // MEMBER DATA
      // ========================================

      const member = {

        member_id:
          memberIdValue,

        full_name:
          fullNameValue,

        passport_number:
          passportNumber.value.trim() || null,

        birthday:
          birthday.value || null,

        address:
          address.value.trim() || null,

        contact_number:
          contact.value.trim() || null,

        emergency_contact_person:
          emergencyContact.value.trim() || null,

        emergency_contact_number:
          emergencyNumber.value.trim() || null,

        membership_status:
          "Active",

        photo_url:
          photoUrl
      };

      // ========================================
      // SAVE TO SUPABASE
      // ========================================

      const {
        error: insertError
      } = await supabaseClient
        .from(MEMBERS_TABLE)
        .insert([member]);

      if (insertError) {

        throw insertError;
      }

      // ========================================
      // SUCCESS
      // ========================================

      registrationForm.classList.add(
        "hidden"
      );

      successMessage.classList.remove(
        "hidden"
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    } catch (error) {

      console.error(
        "Registration Error:",
        error
      );

      showError(
        error.message ||
        "Something went wrong. Please try again."
      );

    } finally {

      submitButton.disabled = false;

      submitButton.textContent =
        "Submit Registration";
    }

  }
);

// ========================================
// REGISTER ANOTHER MEMBER
// ========================================

registerAnotherButton.addEventListener(
  "click",
  function () {

    registrationForm.reset();

    photoPreview.innerHTML = "";

    successMessage.classList.add(
      "hidden"
    );

    errorMessage.classList.add(
      "hidden"
    );

    registrationForm.classList.remove(
      "hidden"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);

// ========================================
// SHOW ERROR
// ========================================

function showError(message) {

  errorMessage.textContent =
    message;

  errorMessage.classList.remove(
    "hidden"
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ========================================
// HIDE MESSAGES
// ========================================

function hideMessages() {

  errorMessage.classList.add(
    "hidden"
  );

}
