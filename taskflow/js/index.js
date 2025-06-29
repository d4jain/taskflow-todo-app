document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name");
  const dobInput = document.getElementById("dob");
  const form = document.getElementById("registerForm");
  const error = document.getElementById("error");

  // Auto-redirect if user exists
  const user = JSON.parse(localStorage.getItem("taskflow_user"));
  if (user) {
    window.location.href = "app.html";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const dob = new Date(dobInput.value);

    if (!name || isNaN(dob.getTime())) {
      error.textContent = "Please fill all fields correctly.";
      return;
    }

    const age = calculateAge(dob);
    if (age <= 10) {
      error.textContent = "You must be over 10 years old to use TaskFlow.";
      return;
    }

    localStorage.setItem(
      "taskflow_user",
      JSON.stringify({ name, dob: dobInput.value })
    );
    window.location.href = "app.html";
  });

  function calculateAge(dob) {
    const diff = Date.now() - dob.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  }
});
