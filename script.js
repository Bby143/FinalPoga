// ========================================
// POGA KSA PUBLIC MEMBER REGISTRATION
// ========================================

// Supabase configuration
const SUPABASE_URL = "https://rocvqcqgbdohfwfkhncy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_wStACVHPYgU82oxbsvAWTg_EdkHrQaF";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ========================================
// STORAGE
// ========================================

const PHOTO_BUCKET = "member-photos";


// ========================================
// FORM ELEMENTS
// ========================================

const memberForm = document.getElementById("memberForm");

const memberId = document.getElementById("memberId");
const fullName = document.getElementById("fullName");
const passportNumber = document.getElementById("passportNumber");
const birthday = document.getElementById("birthday");

const country = document.getElementById("country");

const address = document.getElementById("address");
const contact = document.getElementById("contact");

const emergencyContact =
  document.getElementById("emergencyContact");

const emergencyNumber =
  document.getElementById("emergencyNumber");

const photo = document.getElementById("photo");

const photoPreview =
  document.getElementById("photoPreview");

const registerButton =
  document.getElementById("registerButton");

const successMessage =
  document.getElementById("successMessage");

const registerAnotherButton =
  document.getElementById("registerAnotherButton");


// ========================================
// PHOTO PREVIEW
// ========================================

photo.addEventListener("change", function () {

  photoPreview.innerHTML = "";

  const file = photo.files[0];

  if (!file) {
    return;
  }


  // Check if image
  if (!file.type.startsWith("image/")) {

    alert("Please select an image file.");

    photo.value = "";

    return;
  }


  // Maximum 5MB
  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {

    alert("Photo size must not exceed 5MB.");

    photo.value = "";

    return;
  }


  // Create preview
  const reader = new FileReader();

  reader.onload = function (event) {

    const img = document.createElement("img");

    img.src = event.target.result;

    img.alt = "Photo Preview";

    img.className = "preview-image";

    photoPreview.appendChild(img);

  };

  reader.readAsDataURL(file);

});


// ========================================
// UPLOAD PHOTO
// ========================================

async function uploadPhoto(file) {

  if (!file) {
    return null;
  }


  // Get file extension
  const originalName = file.name || "";

  const extension =
    originalName.includes(".")
      ? originalName.split(".").pop().toLowerCase()
      : "jpg";


  // Generate unique filename
  const fileName =
    `member_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}.${extension}`;


  // Upload to Supabase Storage
  const { error: uploadError } =
    await supabaseClient
      .storage
      .from(PHOTO_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false
      });


  if (uploadError) {

    console.error(
      "Photo upload error:",
      uploadError
    );

    throw new Error(
      "Unable to upload member photo."
    );
  }


  // Get public URL
  const { data } =
    supabaseClient
      .storage
      .from(PHOTO_BUCKET)
      .getPublicUrl(fileName);


  if (!data || !data.publicUrl) {

    throw new Error(
      "Unable to create photo URL."
    );
  }


  return data.publicUrl;
}


// ========================================
// REGISTER MEMBER
// ========================================

async function registerMember() {

  try {

    // Disable button while submitting
    registerButton.disabled = true;

    registerButton.textContent =
      "Registering...";


    // Validate photo
    const photoFile = photo.files[0];

    if (!photoFile) {

      throw new Error(
        "Please upload a member photo."
      );
    }


    // Validate photo type
    if (!photoFile.type.startsWith("image/")) {

      throw new Error(
        "Please upload a valid image file."
      );
    }


    // Validate photo size
    const maxSize = 5 * 1024 * 1024;

    if (photoFile.size > maxSize) {

      throw new Error(
        "Photo size must not exceed 5MB."
      );
    }


    // ========================================
    // UPLOAD PHOTO
    // ========================================

    const photoUrl =
      await uploadPhoto(photoFile);


    // ========================================
    // MEMBER DATA
    // ========================================

    const memberData = {

      member_id:
        memberId.value.trim(),

      full_name:
        fullName.value.trim(),

      passport_number:
        passportNumber.value.trim(),

      birthday:
        birthday.value || null,

      country:
        country.value || null,

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


    // ========================================
    // INSERT MEMBER
    // ========================================

    const { error: insertError } =
      await supabaseClient
        .from("members")
        .insert([memberData]);


    if (insertError) {

      console.error(
        "Member registration error:",
        insertError
      );

      throw new Error(
        insertError.message ||
        "Unable to register member."
      );
    }


    // ========================================
    // SUCCESS
    // ========================================

    memberForm.classList.add("hidden");

    successMessage.classList.remove("hidden");


    // Scroll to success message
    successMessage.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });


  } catch (error) {

    console.error(
      "Registration error:",
      error
    );

    alert(
      error.message ||
      "Something went wrong. Please try again."
    );


  } finally {

    registerButton.disabled = false;

    registerButton.textContent =
      "Register Member";

  }

}


// ========================================
// FORM SUBMIT
// ========================================

memberForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    await registerMember();

  }
);


// ========================================
// REGISTER ANOTHER MEMBER
// ========================================

registerAnotherButton.addEventListener(
  "click",
  function () {

    // Reset form
    memberForm.reset();


    // Clear photo preview
    photoPreview.innerHTML = "";


    // Hide success message
    successMessage.classList.add(
      "hidden"
    );


    // Show form
    memberForm.classList.remove(
      "hidden"
    );


    // Scroll to top of form
    memberForm.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }
);
