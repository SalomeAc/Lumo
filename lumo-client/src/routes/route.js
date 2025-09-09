import {
  registerUser,
  loginUser,
  getUserProfileInfo,
} from "../services/userService.js";
import {
  createTask,
  createList,
  getUserLists,
  getListTasks,
} from "../services/taskListService.js";

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
  ongoing: "dashboard",
  unassigned: "dashboard",
  completed: "dashboard",
  "create-task": "dashboard",
  "create-list": "dashboard",
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

  if (name === "home") initHome();
  if (name === "register") initRegister();
  if (name === "login") initLogin();
  if (name === "dashboard") initDashboard();
  if (name === "create-task") initCreateTask();
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

  // Para rutas dinámicas tipo list/:id
  const listMatch = path.match(/^list\/(.+)$/);
  if (listMatch) {
    const listId = listMatch[1]; // capturamos el id
    loadView("board").then(() => initBoard(listId));
    return;
  }

  const known = [
    "home",
    "login",
    "register",
    "password-recovery",
    "dashboard",
    "ongoing",
    "unassigned",
    "completed",
    "board",
    "create-task",
    "create-list",
  ];
  const route = known.includes(path) ? path : "home";

  loadView(route).catch((err) => {
    console.error(err);
    app.innerHTML = `<p style="color:#ffb4b4">Error loading the view.</p>`;
  });
}

/* ---- View-specific logic ---- */

/**
 * Initialize the "home" view.
 * Disables loguin button if the user is already logged in.
 */
async function initHome() {
  const loginBtn = document.getElementById("login-button");
  const token = localStorage.getItem("token");

  if (token) {
    loginBtn.hidden = true;
  }
}

async function initCreateTask() {
  const activeListId = localStorage.getItem("activeListId");
  const form = document.getElementById("taskForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Captura de fecha y hora
    const date = form["task-date"].value;
    const time = form["task-time"].value;

    // Construcción del objeto de tarea
    const data = {
      title: form["task-title"].value.trim(),
      description: form["task-desc"].value.trim(),
      status: form["task-status"].value,
      dueDate: `${date}T${time}:00`,
      activeListId,
    };

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token) throw new Error("Usuario no autenticado.");

      // Llamada al servicio
      const result = await createTask(data, token, userId);

      console.log("Task creada:", result);
      alert("Tarea creada exitosamente 🎉");
      form.reset(); // limpiar campos después de enviar
      // Regresar al dashboard y refrescará automáticamente
      location.hash = "#/dashboard";
    } catch (err) {
      console.error("Error creando tarea:", err.message);
      alert(`Error creando tarea: ${err.message}`);
    }
  });
}

async function initCreateList() {
  const form = document.getElementById("listForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      title: form["list-title"].value.trim(),
    };

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token) throw new Error("Usuario no autenticado.");

      // Llamada al servicio
      const result = await createList(data, token, userId);

      console.log("List creada:", result);
      alert("Tarea creada exitosamente 🎉");
      form.reset();
    } catch (err) {
      console.error("Error creando lista:", err.message);
      alert(`Error creando lista: ${err.message}`);
    }
  });
}

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
  form.addEventListener(
    "invalid",
    (e) => {
      const input = e.target;
      // Password validation logic.
      if (input.name === "password") {
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(input.value)) {
          input.setCustomValidity(
            "The password must be at least 8 characters and include an uppercase letter, lowercase letter, number and a special character.",
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
            "Please enter a valid email address (e.g., user@domain.com).",
          );
        } else {
          input.setCustomValidity("");
        }
      }
    },
    true,
  );

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
  form.addEventListener(
    "invalid",
    (e) => {
      const input = e.target;

      switch (input.name) {
        case "email":
          if (input.validity.valueMissing) {
            input.setCustomValidity("Email is a required field.");
          } else if (input.validity.typeMismatch) {
            input.setCustomValidity(
              "Please enter a valid email address (e.g., user@domain.com).",
            );
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
    },
    true,
  );

  // Function that handles login and saves the token
  async function handleLogin(data) {
    const formButton = form.querySelector('button[type="submit"]');

    try {
      const response = await loginUser(data); // loginUser from userService.js
      const token = response.token; // assuming the backend returns { token }
      const userId = response.userId;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);

      msg.textContent = "You have successfully logged in! 🎉";
      msg.style.color = "green";
      msg.hidden = false;
      form.reset();

      setTimeout(() => {
        location.hash = "#/dashboard";
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
function initDashboard(listId = null) {
  /**
   * Deletes the JWT token in the local storage and redirects user to home.
   */
  function handleLogout() {
    localStorage.removeItem("token");
    location.hash = "#/home";
  }

  /**
   * Retrieves all the user associated lists and inserts them into
   * "dynamic-ul" then adds an event for each of them.
   *
   * @async
   * @function handleGetUserLists
   * @throws {Error} Throws an error if fetching lists fails.
   */
  async function handleGetUserLists() {
    const dynamicUl = document.getElementById("dynamic-ul");

    try {
      const response = await getUserLists(token, userId);
      const lists = Array.isArray(response) ? response : response?.lists || [];

      dynamicUl.innerHTML = ""; // limpiamos antes de agregar

      lists.forEach((list) => {
        const li = document.createElement("li");

        li.textContent = list.title;
        li.style.cursor = "pointer"; // que parezca clickable
        li.addEventListener("click", () => {
          localStorage.setItem("activeListId", list._id);
          handleGetListTasks(list._id);
        });

        dynamicUl.appendChild(li);
      });

      // Auto-selecciona la lista por defecto "Tasks" o la primera disponible
      const preferred =
        lists.find((l) => l.title === "Tasks") || (lists.length ? lists[0] : null);
      if (preferred) {
        localStorage.setItem("activeListId", preferred._id);
        handleGetListTasks(preferred._id);
      }
    } catch (err) {
      console.error("Error loading user lists:", err.message);
    }
  }

  /**
   * Fetches all tasks associated with a given list and renders them
   * dynamically into the DOM element with id "tasks-grid".
   *
   * @async
   * @function handleGetListTasks
   * @param {string} listId - The unique identifier of the list whose tasks will be fetched.
   * @throws {Error} Throws an error if fetching tasks fails.
   */
  async function handleGetListTasks(listId) {
    const tasksGrid = document.querySelector(".tasks-grid");

    try {
      const response = await getListTasks(listId, token, userId);
      const tasks = Array.isArray(response) ? response : response?.tasks || [];

      if (!tasksGrid) return;
      tasksGrid.innerHTML = "";

      tasks.forEach((task) => {
        const card = document.createElement("div");
        card.className = "task-card";

        // Encabezado
        const header = document.createElement("div");
        header.className = "task-header";

        const h3 = document.createElement("h3");

        // Circle con color según status
        const circle = document.createElement("span");
        circle.className = "circle";
        // Mapear estados del backend a colores
        switch (task.status) {
          case "Unassigned":
            circle.classList.add("gray");
            break;
          case "On going":
            circle.classList.add("yellow");
            break;
          case "Done":
            circle.classList.add("green");
            break;
          default:
            circle.classList.add("gray");
        }

        h3.appendChild(circle);
        h3.appendChild(document.createTextNode(` ${task.title}`));
        header.appendChild(h3);

        // Botones
        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "✎";
        // agregar listener si quieres editar

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "🗑️";
        // agregar listener si quieres eliminar

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        header.appendChild(actions);

        // Descripción
        const desc = document.createElement("p");
        desc.textContent = task.description || "";

        // Footer con dueDate
        const footer = document.createElement("div");
        footer.className = "task-footer";

        const due = document.createElement("span");
        due.className = "due-date";
        due.textContent = `🗓️ ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}`;

        footer.appendChild(due);

        // Armar card
        card.appendChild(header);
        card.appendChild(desc);
        card.appendChild(footer);

        tasksGrid.appendChild(card);
      });
    } catch (err) {
      console.error("Error loading list tasks:", err.message);
    }
  }

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    console.error("Usuario no autenticado.");
    location.hash = "#/login";
  }

  handleGetUserLists();
}