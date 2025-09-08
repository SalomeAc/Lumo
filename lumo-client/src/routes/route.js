import { registerUser } from "../services/userService.js";

const app = document.getElementById("app");

/**
 * Build a safe URL for fetching view fragments inside Vite (dev and build).
 * @param {string} name - The name of the view (without extension).
 * @returns {URL} The resolved URL for the view HTML file.
 */
const viewURL = (name) => new URL(`../views/${name}.html`, import.meta.url);

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
  console.log(name);

  if (name === "home") initHome();
  if (name === "login") initLogin();
  if (name === "register") initRegister();
  if (name === "board") initBoard();
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
  const known = ["home", "login", "register", "password-recovery", "dashboard"];
  const route = known.includes(path) ? path : "home";

  loadView(route).catch((err) => {
    console.error(err);
    app.innerHTML = `<p style="color:#ffb4b4">Error loading the view.</p>`;
  });
}

/* ---- View-specific logic ---- */

function initHome() {
  console.log("hola");
}

function initLogin() {
  console.log("hola");
}

/**
 * Initialize the "register" view.
 * Attaches a submit handler to the register form to navigate to the board.
 */
function initRegister() {
  const form = document.getElementById("registerForm");
  const msg = document.getElementById("registerMsg");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    // Recolecta todos los campos del formulario
    const data = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      age: form.age.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value,
      confirmPassword: form.confirmPassword.value,
    };

    // Validación rápida en frontend
    if (Object.values(data).some((v) => !v)) {
      msg.textContent = "Por favor completa todos los campos.";
      return;
    }

    //validación de edad
    const ageNum = Number(data.age);
    if (isNaN(ageNum) || ageNum < 13) {
      msg.textContent = "La edad debe ser un número mayor o igual a 13.";
      return;
    }

    //validación de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(data.password)) {
      msg.textContent =
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.";
      return;
    }

    //validación de confirmar contraseña
    if (data.password !== data.confirmPassword) {
      msg.textContent = "Las contraseñas no coinciden.";
      return;
    }

    form.querySelector('button[type="submit"]').disabled = true;

    try {
      await registerUser(data);
      msg.textContent = "Registro exitoso";
      form.reset();
      setTimeout(() => (location.hash = "#/board"), 400);
    } catch (err) {
      msg.textContent = `No se pudo registrar: ${err.message}`;
    } finally {
      form.querySelector('button[type="submit"]').disabled = false;
    }
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
