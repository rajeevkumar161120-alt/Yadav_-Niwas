import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* ================= FIREBASE ================= */

const firebaseConfig = {
  apiKey: "AIzaSyDk8rPoi14IhKxJc7OXln9wqU2EffDYb-0",
  authDomain: "yadavniwas-9d443.firebaseapp.com",
  projectId: "yadavniwas-9d443",
  storageBucket: "yadavniwas-9d443.firebasestorage.app",
  messagingSenderId: "325986703199",
  appId: "1:325986703199:web:d16d39a37178614f7588ea",
  measurementId: "G-XM2Z493YHQ"
};

const ADMIN_EMAIL = "rajeevkumar161120@gmail.com";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* ================= COLLECTIONS ================= */

const eventsRef = collection(db, "homes");
const galleryRef = collection(db, "gallery");
const storiesRef = collection(db, "stories");


/* ================= HELPERS ================= */

const $ = (selector) => document.querySelector(selector);

function first(...selectors) {
  for (const selector of selectors) {
    const element = $(selector);
    if (element) return element;
  }
  return null;
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "तारीख उपलब्ध नहीं";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return escapeHTML(value);
  }

  return new Intl.DateTimeFormat("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function isAdmin(user = auth.currentUser) {
  return !!user &&
    String(user.email || "").toLowerCase() ===
    ADMIN_EMAIL.toLowerCase();
}

async function requireAdmin() {
  const user = auth.currentUser;

  if (!isAdmin(user)) {
    throw new Error("Admin authorization required.");
  }

  return user;
}


/* ================= FIREBASE ERRORS ================= */

function friendlyError(error) {

  const code = error?.code || "";

  const messages = {

    "auth/invalid-credential":
      "Email या password गलत है।",

    "auth/invalid-login-credentials":
      "Email या password गलत है।",

    "auth/wrong-password":
      "Password गलत है।",

    "auth/user-not-found":
      "यह Gmail Firebase Authentication में नहीं मिला।",

    "auth/invalid-email":
      "कृपया सही Gmail/email दर्ज करें।",

    "auth/user-disabled":
      "यह Admin account disabled है।",

    "auth/too-many-requests":
      "बहुत अधिक login attempts हुए हैं। थोड़ी देर बाद फिर प्रयास करें।",

    "auth/network-request-failed":
      "Internet connection जाँचें और फिर प्रयास करें।",

    "auth/operation-not-allowed":
      "Firebase में Email/Password Authentication enabled नहीं है।",

    "permission-denied":
      "Firestore permission denied है। Firebase Rules जाँचें।"

  };

  return messages[code] ||
    error?.message ||
    "कुछ गलत हो गया।";
}


/* =====================================================
   ADMIN LOGIN
   पुराने और नए दोनों IDs support होंगे
===================================================== */

async function login() {

  const emailInput = first(
    "#admin-email",
    "#email"
  );

  const passwordInput = first(
    "#admin-password",
    "#password"
  );

  const message = first(
    "#login-message",
    "#loginMessage"
  );

  const button = first(
    "#login-btn",
    "#loginBtn"
  );

  if (!emailInput || !passwordInput) {

    console.error(
      "Login inputs नहीं मिले।",
      emailInput,
      passwordInput
    );

    if (message) {
      message.textContent =
        "Login fields नहीं मिले। admin.html जाँचें।";
    }

    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {

    if (message) {
      message.textContent =
        "Gmail और password दोनों भरें।";
    }

    return;
  }

  if (message) {
    message.textContent = "Login हो रहा है…";
  }

  if (button) {
    button.disabled = true;
  }

  try {

    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    if (!isAdmin(credential.user)) {

      await signOut(auth);

      if (message) {
        message.textContent =
          "यह account Admin account नहीं है।";
      }

      return;
    }

    if (message) {
      message.textContent =
        "Login सफल हो गया।";
    }

  } catch (error) {

    console.error("Firebase Login Error:", error);

    if (message) {
      message.textContent =
        "Login failed: " + friendlyError(error);
    }

  } finally {

    if (button) {
      button.disabled = false;
    }

  }
}


async function forgotPassword() {

  const emailInput = first("#admin-email", "#email");
  const message = first("#login-message", "#loginMessage");
  const email = emailInput?.value.trim() || "";

  if (!email) {
    if (message) message.textContent = "पहले Admin Gmail दर्ज करें।";
    emailInput?.focus();
    return;
  }

  if (message) message.textContent = "Password reset email भेजा जा रहा है…";

  try {
    await sendPasswordResetEmail(auth, email);
    if (message) message.textContent = "Password reset email भेज दिया गया है। Gmail Inbox/Spam चेक करें।";
  } catch (error) {
    console.error("Password reset error:", error);
    if (message) message.textContent = "Reset failed: " + friendlyError(error);
  }
}

/* ================= LOGOUT ================= */

async function logout() {

  try {

    await signOut(auth);

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  }
}


/* =====================================================
   ADMIN UI
===================================================== */

function showAdminDashboard(user) {

  const loginBox = first(
    "#login-panel",
    "#loginBox"
  );

  const adminBox = first(
    "#dashboard-panel",
    "#adminBox"
  );

  const userLabel = first(
    "#signed-in-user",
    "#adminUser"
  );

  if (loginBox) {
    loginBox.classList.add("hidden");
  }

  if (adminBox) {
    adminBox.classList.remove("hidden");
  }

  if (userLabel) {
    userLabel.textContent =
      `Signed in as: ${user.email}`;
  }

  loadEvents();
  loadGallery();
  loadStories();
}


function showLoginScreen() {

  const loginBox = first(
    "#login-panel",
    "#loginBox"
  );

  const adminBox = first(
    "#dashboard-panel",
    "#adminBox"
  );

  const userLabel = first(
    "#signed-in-user",
    "#adminUser"
  );

  if (loginBox) {
    loginBox.classList.remove("hidden");
  }

  if (adminBox) {
    adminBox.classList.add("hidden");
  }

  if (userLabel) {
    userLabel.textContent = "";
  }
}


/* =====================================================
   EVENTS
===================================================== */

async function addEvent() {

  const title = first(
    "#event-title",
    "#eventTitle"
  );

  const date = first(
    "#event-date",
    "#eventDate"
  );

  const text = first(
    "#event-text",
    "#eventText"
  );

  const message = first(
    "#event-message",
    "#eventMessage"
  );

  if (!title || !date || !text) {
    console.error("Event fields नहीं मिले।");
    return;
  }

  const data = {

    title: title.value.trim(),

    date: date.value,

    text: text.value.trim(),

    createdAt: serverTimestamp()

  };

  if (!data.title ||
      !data.date ||
      !data.text) {

    if (message) {
      message.textContent =
        "Event title, date और description भरें।";
    }

    return;
  }

  try {

    await requireAdmin();

    if (message) {
      message.textContent =
        "Event save हो रहा है…";
    }

    await addDoc(
      eventsRef,
      data
    );

    const form = first(
      "#event-form",
      "#eventForm"
    );

    form?.reset();

    if (message) {
      message.textContent =
        "Event सफलतापूर्वक save हो गया।";
    }

    await loadEvents();

  } catch (error) {

    console.error(
      "Add event error:",
      error
    );

    if (message) {
      message.textContent =
        friendlyError(error);
    }

  }
}


async function deleteEvent(id) {

  if (!confirm(
    "क्या आप इस Event को delete करना चाहते हैं?"
  )) {
    return;
  }

  try {

    await requireAdmin();

    await deleteDoc(
      doc(db, "homes", id)
    );

    await loadEvents();

  } catch (error) {

    console.error(
      "Delete event error:",
      error
    );

    alert(
      friendlyError(error)
    );

  }
}


function eventMarkup(event, admin = false) {

  const title =
    escapeHTML(
      event.title || "Event"
    );

  const date =
    escapeHTML(
      formatDate(event.date)
    );

  const text =
    escapeHTML(
      event.text || ""
    ).replaceAll(
      "\n",
      "<br>"
    );

  return `

    <article class="event-card">

      <div class="event-date">
        ${date}
      </div>

      <div class="event-content">

        <h3>
          ${title}
        </h3>

        <p>
          ${text}
        </p>

      </div>

      ${
        admin
          ? `
            <button
              type="button"
              class="delete-event"
              data-event-id="${escapeHTML(event.id)}">
              Delete
            </button>
          `
          : ""
      }

    </article>

  `;
}


async function loadEvents() {

  const homeContainer =
    first("#home-events");

  const adminContainer =
    first(
      "#admin-events",
      "#adminEvents"
    );

  if (!homeContainer &&
      !adminContainer) {
    return;
  }

  try {

    const snapshot =
      await getDocs(
        query(
          eventsRef,
          orderBy("date", "desc")
        )
      );

    const events =
      snapshot.docs.map(
        item => ({
          id: item.id,
          ...item.data()
        })
      );

    if (homeContainer) {

      homeContainer.innerHTML =
        events.length
          ? events
              .map(
                event =>
                  eventMarkup(event)
              )
              .join("")
          : `
            <div class="empty-card">
              अभी कोई event नहीं है।
            </div>
          `;
    }

    if (adminContainer) {

      adminContainer.innerHTML =
        events.length
          ? events
              .map(
                event =>
                  eventMarkup(
                    event,
                    true
                  )
              )
              .join("")
          : `
            <div class="empty-card">
              अभी कोई saved event नहीं है।
            </div>
          `;

      adminContainer
        .querySelectorAll(
          ".delete-event"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            () =>
              deleteEvent(
                button.dataset.eventId
              )
          );

        });

    }

  } catch (error) {

    console.error(
      "Load events error:",
      error
    );

    const html = `
      <div class="empty-card error-card">
        Events load नहीं हो पाए।
        <br>
        ${escapeHTML(
          friendlyError(error)
        )}
      </div>
    `;

    if (homeContainer) {
      homeContainer.innerHTML = html;
    }

    if (adminContainer) {
      adminContainer.innerHTML = html;
    }

  }
}


/* =====================================================
   GALLERY
===================================================== */

function galleryMarkup(
  item,
  admin = false
) {

  const title =
    escapeHTML(
      item.title ||
      "Yadav Niwas"
    );

  const src =
    escapeHTML(
      item.src || ""
    );

  return `

    <figure class="gallery-item">

      <img
        src="${src}"
        alt="${title}"
        loading="lazy">

      <figcaption>
        ${title}
      </figcaption>

      ${
        admin
          ? `
            <button
              type="button"
              class="delete-gallery"
              data-id="${escapeHTML(item.id)}">
              Delete
            </button>
            <button
              type="button"
              class="edit-gallery"
              data-id="${escapeHTML(item.id)}">
              Edit
            </button>
          `
          : ""
      }

    </figure>

  `;
}


async function loadGallery() {

  const homeContainer =
    first("#dynamic-gallery");

  const adminContainer =
    first(
      "#admin-gallery",
      "#adminGallery"
    );

  if (!homeContainer &&
      !adminContainer) {
    return;
  }

  try {

    const snapshot =
      await getDocs(
        query(
          galleryRef,
          orderBy(
            "createdAt",
            "desc"
          )
        )
      );

    const items =
      snapshot.docs.map(
        item => ({
          id: item.id,
          ...item.data()
        })
      );

    if (homeContainer) {

      homeContainer.innerHTML =
        items
          .map(
            item =>
              galleryMarkup(item)
          )
          .join("");

    }

    if (adminContainer) {

      adminContainer.innerHTML =
        items.length
          ? items
              .map(
                item =>
                  galleryMarkup(
                    item,
                    true
                  )
              )
              .join("")
          : `
            <div class="empty-card">
              अभी कोई नई photo नहीं है।
            </div>
          `;

      adminContainer
        .querySelectorAll(
          ".delete-gallery"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            () =>
              deleteGalleryItem(
                button.dataset.id
              )
          );

        });

      adminContainer
        .querySelectorAll(".edit-gallery")
        .forEach(button => {
          button.addEventListener("click", () => editGalleryItem(button.dataset.id));
        });

    }

  } catch (error) {

    console.error(
      "Gallery error:",
      error
    );

  }
}


async function compressImage(file) {
  const maxBytes = 900 * 1024;
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image पढ़ी नहीं जा सकी।"));
    img.src = URL.createObjectURL(file);
  });

  let width = image.naturalWidth;
  let height = image.naturalHeight;
  const maxSide = 1600;
  if (Math.max(width, height) > maxSide) {
    const scale = maxSide / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.drawImage(image, 0, 0, width, height);
  URL.revokeObjectURL(image.src);

  let quality = 0.82;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length * 0.75 > maxBytes && quality > 0.45) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (dataUrl.length * 0.75 > maxBytes) {
    throw new Error("Photo बहुत बड़ी है। कृपया छोटी photo चुनें।");
  }

  return dataUrl;
}

async function addGalleryItem() {
  const title = first("#gallery-title", "#galleryTitle");
  const fileInput = first("#gallery-file", "#galleryFile");
  const message = first("#gallery-message", "#galleryMessage");

  if (!title || !fileInput) return;

  const titleValue = title.value.trim();
  const file = fileInput.files?.[0];

  if (!titleValue || !file) {
    if (message) message.textContent = "Photo title और photo दोनों चुनें।";
    return;
  }

  if (!file.type.startsWith("image/")) {
    if (message) message.textContent = "कृपया केवल image file चुनें।";
    return;
  }

  try {
    await requireAdmin();
    if (message) message.textContent = "Photo compress और upload हो रही है…";
    const src = await compressImage(file);

    await addDoc(galleryRef, {
      title: titleValue,
      src,
      originalName: file.name,
      createdAt: serverTimestamp()
    });

    const form = first("#gallery-form", "#galleryForm");
    form?.reset();
    const preview = first("#gallery-preview", "#galleryPreview");
    if (preview) { preview.hidden = true; preview.innerHTML = ""; }
    if (message) message.textContent = "Photo successfully upload होकर Gallery में add हो गई।";
    await loadGallery();
  } catch (error) {
    console.error("Gallery upload error:", error);
    if (message) message.textContent = friendlyError(error);
  }
}

async function editGalleryItem(id) {
  const newTitle = prompt("Photo title बदलें:");
  if (newTitle === null) return;
  const title = newTitle.trim();
  if (!title) { alert("Title खाली नहीं हो सकता।"); return; }

  const newFileInput = document.createElement("input");
  newFileInput.type = "file";
  newFileInput.accept = "image/*";
  const chooseNew = confirm("क्या photo भी बदलनी है? OK = नई photo चुनें, Cancel = सिर्फ title बदलें।");

  try {
    await requireAdmin();
    const updateData = { title };
    if (chooseNew) {
      const file = await new Promise(resolve => {
        newFileInput.onchange = () => resolve(newFileInput.files?.[0] || null);
        newFileInput.click();
      });
      if (!file) return;
      updateData.src = await compressImage(file);
      updateData.originalName = file.name;
    }
    // Use updateDoc without requiring a new collection read.
    await updateDoc(doc(db, "gallery", id), updateData);
    await loadGallery();
  } catch (error) {
    console.error("Gallery edit error:", error);
    alert(friendlyError(error));
  }
}

async function deleteGalleryItem(id) {

  if (!confirm(
    "Gallery entry delete करें?"
  )) {
    return;
  }

  try {

    await requireAdmin();

    await deleteDoc(
      doc(
        db,
        "gallery",
        id
      )
    );

    await loadGallery();

  } catch (error) {

    alert(
      friendlyError(error)
    );

  }
}


/* =====================================================
   STORIES / UPDATES
===================================================== */

function storyMarkup(
  story,
  admin = false
) {

  const title =
    escapeHTML(
      story.title ||
      "Update"
    );

  const date =
    escapeHTML(
      formatDate(
        story.date
      )
    );

  const text =
    escapeHTML(
      story.text || ""
    ).replaceAll(
      "\n",
      "<br>"
    );

  const photo =
    story.photo
      ? `
        <img
          src="${escapeHTML(story.photo)}"
          alt="${title}"
          loading="lazy">
      `
      : "";

  return `

    <article class="story-card">

      ${photo}

      <div class="story-body">

        <div class="story-date">
          ${date}
        </div>

        <h3>
          ${title}
        </h3>

        <p>
          ${text}
        </p>

        ${
          admin
            ? `
              <button
                type="button"
                class="delete-story"
                data-story-id="${escapeHTML(story.id)}">
                Delete
              </button>
            `
            : ""
        }

      </div>

    </article>

  `;
}


async function loadStories() {

  const homeContainer =
    first("#home-stories");

  const adminContainer =
    first(
      "#admin-stories",
      "#adminStories"
    );

  if (!homeContainer &&
      !adminContainer) {
    return;
  }

  try {

    const snapshot =
      await getDocs(
        query(
          storiesRef,
          orderBy(
            "date",
            "desc"
          )
        )
      );

    let stories =
      snapshot.docs.map(
        item => ({
          id: item.id,
          ...item.data()
        })
      );

    if (homeContainer) {

      stories =
        stories.filter(
          story =>
            story.published === true
        );

    }

    if (homeContainer) {

      homeContainer.innerHTML =
        stories.length
          ? stories
              .map(
                story =>
                  storyMarkup(story)
              )
              .join("")
          : `
            <div class="empty-card">
              अभी कोई update नहीं है।
            </div>
          `;

    }

    if (adminContainer) {

      adminContainer.innerHTML =
        stories.length
          ? stories
              .map(
                story =>
                  storyMarkup(
                    story,
                    true
                  )
              )
              .join("")
          : `
            <div class="empty-card">
              अभी कोई saved story नहीं है।
            </div>
          `;

      adminContainer
        .querySelectorAll(
          ".delete-story"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            () =>
              deleteStory(
                button.dataset.storyId
              )
          );

        });

    }

  } catch (error) {

    console.error(
      "Stories error:",
      error
    );

  }
}


async function addStory() {

  const title =
    first(
      "#story-title",
      "#storyTitle"
    );

  const date =
    first(
      "#story-date",
      "#storyDate"
    );

  const text =
    first(
      "#story-text",
      "#storyText"
    );

  const photo =
    first(
      "#story-photo",
      "#storyPhoto"
    );

  const published =
    first(
      "#story-published",
      "#storyPublished"
    );

  const message =
    first(
      "#story-message",
      "#storyMessage"
    );

  if (!title ||
      !date ||
      !text) {
    return;
  }

  const data = {

    title:
      title.value.trim(),

    date:
      date.value,

    text:
      text.value.trim(),

    photo:
      photo?.value.trim() || "",

    published:
      published
        ? published.checked
        : true,

    createdAt:
      serverTimestamp()

  };

  if (!data.title ||
      !data.date ||
      !data.text) {

    if (message) {
      message.textContent =
        "Title, date और text भरना जरूरी है।";
    }

    return;
  }

  if (
    data.photo &&
    !data.photo.startsWith(
      "images/"
    )
  ) {

    if (message) {
      message.textContent =
        "Photo path images/ से शुरू होना चाहिए।";
    }

    return;
  }

  try {

    await requireAdmin();

    await addDoc(
      storiesRef,
      data
    );

    const form =
      first(
        "#story-form",
        "#storyForm"
      );

    form?.reset();

    if (message) {
      message.textContent =
        "Story / Update save हो गई।";
    }

    await loadStories();

  } catch (error) {

    console.error(
      "Story error:",
      error
    );

    if (message) {
      message.textContent =
        friendlyError(error);
    }

  }
}


async function deleteStory(id) {

  if (!confirm(
    "क्या यह Story / Update delete करनी है?"
  )) {
    return;
  }

  try {

    await requireAdmin();

    await deleteDoc(
      doc(
        db,
        "stories",
        id
      )
    );

    await loadStories();

  } catch (error) {

    alert(
      friendlyError(error)
    );

  }
}


/* =====================================================
   HOME
===================================================== */

function setupHome() {

  const year =
    $("#year");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }

  loadEvents();
  loadGallery();
  loadStories();
}


/* =====================================================
   ADMIN SETUP
===================================================== */

function setupAdmin() {

  /* FORM SUBMIT */

  $("#login-form")
    ?.addEventListener(
      "submit",
      event => {
        event.preventDefault();
        login();
      }
    );


  /* OLD LOGIN BUTTON */

  $("#loginBtn")
    ?.addEventListener(
      "click",
      event => {
        event.preventDefault();
        login();
      }
    );


  /* NEW LOGIN BUTTON */

  $("#login-btn")
    ?.addEventListener(
      "click",
      event => {
        event.preventDefault();
        login();
      }
    );


  /* PASSWORD */

  $("#toggle-password")?.addEventListener("click", () => {
    const input = $("#admin-password");
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
  });

  $("#forgot-password")?.addEventListener("click", forgotPassword);

  /* LOGOUT */

  $("#logout-btn")
    ?.addEventListener(
      "click",
      logout
    );

  $("#logoutBtn")
    ?.addEventListener(
      "click",
      logout
    );


  /* EVENT */

  $("#event-form")
    ?.addEventListener(
      "submit",
      event => {
        event.preventDefault();
        addEvent();
      }
    );

  $("#addEventBtn")
    ?.addEventListener(
      "click",
      event => {
        event.preventDefault();
        addEvent();
      }
    );

  $("#add-event-btn")
    ?.addEventListener(
      "click",
      event => {
        event.preventDefault();
        addEvent();
      }
    );


  /* GALLERY */

  $("#gallery-form")
    ?.addEventListener(
      "submit",
      event => {
        event.preventDefault();
        addGalleryItem();
      }
    );

  $("#addGalleryBtn")
    ?.addEventListener(
      "click",
      event => {
        event.preventDefault();
        addGalleryItem();
      }
    );


  /* STORIES */

  $("#story-form")
    ?.addEventListener(
      "submit",
      event => {
        event.preventDefault();
        addStory();
      }
    );

  $("#addStoryBtn")
    ?.addEventListener(
      "click",
      event => {
        event.preventDefault();
        addStory();
      }
    );


  const galleryFile = $("#gallery-file");
  galleryFile?.addEventListener("change", () => {
    const file = galleryFile.files?.[0];
    const preview = $("#gallery-preview");
    if (!preview) return;
    if (!file) { preview.hidden = true; preview.innerHTML = ""; return; }
    const url = URL.createObjectURL(file);
    preview.hidden = false;
    preview.innerHTML = `<img src="${url}" alt="Preview">`;
  });

  /* AUTH STATE */

  onAuthStateChanged(
    auth,
    async user => {

      if (user && isAdmin(user)) {

        showAdminDashboard(user);

      } else {

        if (user) {
          await signOut(auth);
        }

        showLoginScreen();

      }

    }
  );

}


/* =====================================================
   START
===================================================== */

if (
  document.body.dataset.page === "home"
) {

  setupHome();

}

if (
  document.body.dataset.page === "admin"
) {

  setupAdmin();

}
