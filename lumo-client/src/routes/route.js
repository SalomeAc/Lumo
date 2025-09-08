import {
  registerUser,
  loginUser,
  getUserProfileInfo,
} from "../services/userService.js";

const app = document.getElementById("app");

/**
 * Build a safe URL for fetching view fragments inside Vite (dev and build).
 * @param {string} name - The name of the view (without extension).
 * @returns {URL} The resolved URL for the view HTML file.
 */
const viewURL = (name) => new URL(`../views/${name}.html`, import.meta.url);

/**
 * Build a safe URL for fetching style fragments inside Vite (dev and build).
 * @param {string} name - The name of the style (without extension).
 * @returns {URL} The resolved URL for the style HTML file.
 */
const styleURL = (name) =>
  new URL(`../styles/${name}.css`, import.meta.url).href;

/**
 * Map that associates view names to css styles.
 */
const viewStyleMap = {
  login: "auth",
  register: "auth",
  "password-recovery": "auth",
  home: "home",
  board: "board",
  profile: "profile",
  dashboard: "dashboard",
  all: "dashboard",
};

/**
 * Load an HTML fragment by view name and initialize its corresponding logic.
 * @async
 * @param {string} name - The view name to load (e.g., "home", "board").
 * @throws {Error} If the view cannot be fetched.
 */
async function loadView(name) {
  const res = await fetch(viewURL(name));
  if (!res.ok) throw new Error(`Failed to load view: ${name}`);
  const html = await res.text();
  app.innerHTML = html;

  // Debug
  console.log(`Loaded view: ${name}`);

  // Checks the map to see which file to load
  const cssFileName = viewStyleMap[name];
  if (cssFileName) {
    loadViewCSS(styleURL(cssFileName));
  }

  if (name === "register") initRegister();
  if (name === "login") initLogin();
  if (name === "board") initBoard();
  // if (name === "profile") initProfile();
}

/**
 * Dynamically load a CSS file, replacing the previous view's CSS if any.
 * @param {string} href - URL of the CSS file
 */
function loadViewCSS(href) {
  let link = document.getElementById("view-css");

  if (!link) {
    link = document.createElement("link");
    link.id = "view-css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  link.href = href;
}

/**
 * Initialize the hash-based router.
 * Attaches an event listener for URL changes and triggers the first render.
 */
export function initRouter() {
  window.addEventListener("hashchange", handleRoute);
  handleRoute(); // first render
}

/**
 * Handle the current route based on the location hash.
 * Fallback to 'home' if the route is unknown.
 */
function handleRoute() {
  const path =
    (location.hash.startsWith("#/") ? location.hash.slice(2) : "") || "home";
  const known = [
    "home",
    "login",
    "register",
    "password-recovery",
    "dashboard",
    "profile",
    "all",
  ];
  const route = known.includes(path) ? path : "home";

  loadView(route).catch((err) => {
    console.error(err);
    app.innerHTML = `<p style="color:#ffb4b4">Error loading the view.</p>`;
  });
}

/* ---- View-specific logic ---- */

/**
 * Initialize the "profile" view.
 * Receives the user information from the server and shows it.
 */
async function initProfile() {
  const fullNameSpan = document.getElementById("userFullName");
  const userCreatedAtSpan = document.getElementById("userCreatedAt");
  const userEmailSpan = document.getElementById("userEmail");

  try {
    const userData = await getUserProfileInfo();

    fullNameSpan.textContent = `${userData.firstName} ${userData.lastName}`;
    userCreatedAtSpan.textContent = new Date(
      userData.createdAt,
    ).toLocaleDateString();
    userEmailSpan.textContent = userData.email;
  } catch (err) {
    console.error("Couldn't fetch user profile:", err);
    fullNameSpan.textContent = "Error loading profile";
    userCreatedAtSpan.textContent = "-";
    userEmailSpan.textContent = "-";
  }
}

/**
 * Initialize the "register" view.
 * Attaches a submit handler to the register form to navigate to login.
 */
function initRegister() {
  const form = document.getElementById("registerForm");
  const msg = document.getElementById("message");
  const spinner = document.getElementById("spinner");

  if (!form) return;

  // Agarra el evento invalid para cambiar el mensaje de html y hacer uno propio
  form.addEventListener("invalid", (e) => {
    const input = e.target;
    // Password validation logic.
    if (input.name === "password") {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(input.value)) {
        input.setCustomValidity(
          "The password must be at least 8 characters include an uppercase letter, lowercase letter, number and a special character."
        );
      } else {
        input.setCustomValidity("");
      }
    }
    // logica del email
    if (input.name === "email") {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(input.value)) {
            input.setCustomValidity(
                "Please enter a valid email address (e.g., user@domain.com)."
            );
        } else {
            input.setCustomValidity("");
        }
    }
  }, true);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    msg.hidden = true;

    const data = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      age: form.age.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value.trim(),
      confirmPassword: form.confirmPassword.value.trim(),
    };

    const formButton = form.querySelector('button[type="submit"]');

    try {
      // 
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      formButton.disabled = true;
      spinner.style.display = "block";

      await registerUser(data);

      //
      msg.textContent = "Successfully registered! 🎉";
      msg.style.color = "green";
      msg.hidden = false;
      form.reset();

      setTimeout(() => {
        spinner.style.display = "none";
        location.hash = "#/login";
      }, 1000);
    } catch (err) {
      // Trata con los errores de validacion
      msg.textContent = err.message || "Registration failed.";
      msg.style.color = "red";
      msg.hidden = false;
    } finally {
      // Deshabilita el boton y no muestra el spinner
      formButton.disabled = false;
      spinner.style.display = "none";
    }
  });
}

function initLogin() {
    const form = document.getElementById("loginForm");
    const msg = document.getElementById("message");

    if (!form) return;

    // Listens for the 'invalid' event to customize validation messages.
    form.addEventListener("invalid", (e) => {
        const input = e.target;

        switch (input.name) {
            case "email":
                if (input.validity.valueMissing) {
                    input.setCustomValidity("Email is a required field.");
                } else if (input.validity.typeMismatch) {
                    input.setCustomValidity("Please enter a valid email address (e.g., user@domain.com).");
                } else {
                    input.setCustomValidity(""); // Clears the custom error message if valid.
                }
                break;
            case "password":
                if (input.validity.valueMissing) {
                    input.setCustomValidity("Password is a required field.");
                } else {
                    input.setCustomValidity("");
                }
                break;
            default:
                // Clears any other custom validation messages.
                input.setCustomValidity("");
                break;
        }
    }, true);

    // Function that handles login and saves the token
    async function handleLogin(data) {
        const formButton = form.querySelector('button[type="submit"]');
        try {
            const response = await loginUser(data); // loginUser from userService.js
            const token = response.token; // assuming the backend returns { token }

            localStorage.setItem("token", token);

            msg.textContent = "You have successfully logged in! 🎉";
            msg.style.color = "green";
            msg.hidden = false;
            form.reset();

            setTimeout(() => {
                location.hash = "#/board";
            }, 400);
        } catch (err) {
            // Handles login API errors
            msg.textContent = `Could not log in: ${err.message}`;
            msg.hidden = false;
        } finally {
            formButton.disabled = false;
        }
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        msg.textContent = "";

        const data = {
            email: form.email.value.trim(),
            password: form.password.value.trim(),
        };

        // Use checkValidity() to trigger native validation and 'invalid' events.
        if (!form.checkValidity()) {
            return;
        }

        form.querySelector('button[type="submit"]').disabled = true;
        handleLogin(data);
    });
}

/**
 * Initialize the "board" view.
 * Sets up the todo form, input, and list with create/remove/toggle logic.
 */
function initBoard() {
  const form = document.getElementById("todoForm");
  const input = document.getElementById("newTodo");
  const list = document.getElementById("todoList");
  if (!form || !input || !list) return;

  // Add new todo item
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) return;

    const li = document.createElement("li");
    li.className = "todo";
    li.innerHTML = `
      <label>
        <input type="checkbox" class="check">
        <span>${title}</span>
      </label>
      <button class="link remove" type="button">Eliminar</button>
    `;
    list.prepend(li);
    input.value = "";
  });

  // Handle remove and toggle completion
  list.addEventListener("click", (e) => {
    const li = e.target.closest(".todo");
    if (!li) return;
    if (e.target.matches(".remove")) li.remove();
    if (e.target.matches(".check"))
      li.classList.toggle("completed", e.target.checked);
  });
}
