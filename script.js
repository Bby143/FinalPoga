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

const memberTable =
  document.getElementById("memberTable");

const search =
  document.getElementById("search");

const saveButton =
  document.getElementById("saveButton");

const emptyMessage =
  document.getElementById("emptyMessage");


// ================================
// SUBMIT
// ================================

memberForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    await saveMember();

  }
);


// ================================
// SAVE MEMBER
// ================================

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


  try {

    const { error } =
      await supabaseClient

        .from("members")

        .insert([member]);


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


    alert(
      "Member registered successfully!"
    );


    memberForm.reset();


    // IMPORTANT:
    // Reload records after successful save

    await loadMembers();

  }

  catch (error) {

    console.error(
      "SAVE ERROR:",
      error
    );

    alert(
      "Error: " +
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

    console.error(
      "LOAD ERROR:",
      error
    );


    alert(
      "Error loading members:\n\n" +
      error.message
    );

  }

}


// ================================
// DISPLAY MEMBERS
// ================================

function displayMembers(data) {

  memberTable.innerHTML = "";


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
                  src="${escapeHTML(member.photo_url)}"
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
          <span>Saved</span>
        </td>

      `;


      memberTable.appendChild(row);

    }
  );

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

      console.error(
        "SEARCH ERROR:",
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
// ESCAPE HTML
// ================================

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


// ================================
// START
// ================================

loadMembers();
