let tasks = JSON.parse(localStorage.getItem("taskflow_tasks")) || [];

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("taskflow_user"));
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("username").textContent = user.name;
  document.getElementById("avatar").src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(user.name)}`;
  updateDropdown();

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

  // Dummy data fetch on first visit
  if (tasks.length === 0) {
    try {
      const res = await fetch("https://dummyjson.com/todos");
      const data = await res.json();
      tasks = data.todos.slice(0, 5).map((todo, i) => ({
        id: Date.now() + Math.random(),
        title: todo.todo,
        stage: "todo",
        category: i % 3 === 0 ? "daily" : i % 3 === 1 ? "weekly" : "monthly",
        dueDate: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toLocaleString(),
      }));
      localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
    } catch (err) {
      console.error("Failed to fetch dummy tasks:", err);
    }
  }

  renderTasks();

  document.getElementById("addBtn").addEventListener("click", () => {
    const input = document.getElementById("newTask");
    const taskText = input.value.trim();
    const category = document.getElementById("taskView").value;
    if (taskText) {
      tasks.push({
        id: Date.now(),
        title: taskText,
        stage: "todo",
        category,
        updatedAt: new Date().toLocaleString(),
      });
      input.value = "";
      updateTasks();
    }
  });

  document.getElementById("taskView").addEventListener("change", renderTasks);
});

function renderTasks() {
  const selectedCategory = document.getElementById("taskView").value;
  ["todo", "completed", "archived"].forEach(stage => {
    const container = document.getElementById(`${stage}Tasks`);
    container.innerHTML = "";
    const filtered = tasks.filter(t => t.stage === stage && t.category === selectedCategory);
    filtered.forEach(task => {
      const div = document.createElement("div");
      div.className = "task-card";
      div.setAttribute("data-category", task.category);

      const actions = document.createElement("div");
      actions.className = "actions";
      actions.innerHTML = getActions(task);

      div.innerHTML = `
        <p>${task.title}</p>
        <small>Last modified: ${task.updatedAt}</small>
      `;
      div.appendChild(actions);
      container.appendChild(div);
    });
    document.getElementById(`${stage}Count`).textContent = filtered.length;
  });
}

function getActions(task) {
  const id = task.id;
  let actions = "";
  if (task.stage === "todo") {
    actions += `<button onclick="moveTask(${id}, 'completed')">✅</button>`;
    actions += `<button onclick="moveTask(${id}, 'archived')">🗂️</button>`;
  } else if (task.stage === "completed") {
    actions += `<button onclick="moveTask(${id}, 'todo')">↩️</button>`;
    actions += `<button onclick="moveTask(${id}, 'archived')">🗂️</button>`;
  } else if (task.stage === "archived") {
    actions += `<button onclick="moveTask(${id}, 'todo')">↩️</button>`;
    actions += `<button onclick="moveTask(${id}, 'completed')">✅</button>`;
  }
  actions += `<button onclick="editTask(${id})">✏️</button>`;
  actions += `<button onclick="deleteTask(${id})">🗑️</button>`;
  return actions;
}

function moveTask(id, newStage) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.stage = newStage;
    task.updatedAt = new Date().toLocaleString();
    updateTasks();
  }
}

function deleteTask(id) {
  const confirmed = confirm("Are you sure you want to delete this task?");
  if (!confirmed) return;
  tasks = tasks.filter(t => t.id !== id);
  updateTasks();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const newTitle = prompt("Edit your task:", task.title);
  if (newTitle !== null && newTitle.trim() !== "") {
    task.title = newTitle.trim();
    task.updatedAt = new Date().toLocaleString();
    updateTasks();
  }
}

function updateTasks() {
  localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
  renderTasks();
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function updateDropdown() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const options = [
    {
      label: `Today - ${formatDate(today)}`,
      value: "daily"
    },
    {
      label: `This Week - ${formatDate(startOfWeek)} → ${formatDate(endOfWeek)}`,
      value: "weekly"
    },
    {
      label: `This Month - ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`,
      value: "monthly"
    }
  ];

  const taskView = document.getElementById("taskView");
  taskView.innerHTML = "";
  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.label;
    taskView.appendChild(option);
  });
}
