// ============================================
// POGA KSA - MEMBER MANAGEMENT SYSTEM
// SUPABASE VERSION
// ============================================

// ============================================
// SUPABASE CONFIG
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
// VARIABLES
// ============================================

let members = [];
let editIndex = -1;
let selectedPhoto = "";


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


// ============================================
// FORM SUBMIT
// ============================================

if (memberForm) {

  memberForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      saveMember();

    }
  );

}


// ============================================
// SEARCH
// ============================================

if (search) {

  search.addEventListener(
    "input",
    displayMembers
  );

}


// ============================================
// PHOTO PREVIEW
// ============================================

if (photo) {

  photo.addEventListener(
    "change",
    function (event) {

      const file =
        event.target.files[0];

      if (!file) {

        selectedPhoto = "";

        if (photoPreview) {
          photoPreview.innerHTML =
