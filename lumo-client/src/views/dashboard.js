document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("create-list-modal");
  const openBtn = document.getElementById("open-create-list");
  const closeBtn = document.getElementById("close-create-list");
  const form = document.getElementById("create-list-form");
  const dynamicUl = document.getElementById("dynamic-ul");

  // Abrir modal
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.remove("hidden");
  });

  // Cerrar modal
  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Crear lista
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("list-name").value;
    const description = document.getElementById("list-description").value;

    try {
      const response = await fetch("http://localhost:8080/api/v1/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          user: "12345" // ⚡️ reemplaza con el ID real del usuario logueado
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Error: " + errorData.message);
        return;
      }

      const newList = await response.json();

      // Insertar en el sidebar
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#/lists/${newList._id}`;
      a.textContent = newList.name;
      li.appendChild(a);
      dynamicUl.appendChild(li);

      // Resetear formulario y cerrar modal
      form.reset();
      modal.classList.add("hidden");
    } catch (error) {
      console.error("Error creando lista:", error);
    }
  });
});
