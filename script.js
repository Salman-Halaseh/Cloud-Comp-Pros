// Firebase config is loaded from config.js (gitignored)

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Register user
function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => alert("Registration successful! You can now login."))
        .catch(err => alert(err.message));
}

// Login user
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("todo-section").style.display = "block";
            document.getElementById("logoutBtn").style.display = "block";
            loadTasks();
        })
        .catch(err => alert(err.message));
}

// Logout
function logout() {
    auth.signOut();
    location.reload();
}

// Add task
function addTask() {
    const taskInput = document.getElementById("taskInput");
    const prioritySelect = document.getElementById("prioritySelect");
    const task = taskInput.value.trim();
    const priority = prioritySelect.value;
    const user = auth.currentUser;

    if (!task) {
        alert("Please enter a task");
        return;
    }

    db.collection("tasks").add({
        text: task,
        priority: priority,
        completed: false,
        uid: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    taskInput.value = "";
    prioritySelect.value = "medium";
}

// Toggle task completion
function toggleComplete(taskId, currentStatus) {
    db.collection("tasks").doc(taskId).update({
        completed: !currentStatus
    });
}

// Load tasks
function loadTasks() {
    const user = auth.currentUser;

    db.collection("tasks")
        .where("uid", "==", user.uid)
        .orderBy("createdAt", "desc")
        .onSnapshot(snapshot => {
            const list = document.getElementById("taskList");
            const emptyMessage = document.getElementById("emptyMessage");
            list.innerHTML = "";

            if (snapshot.empty) {
                emptyMessage.style.display = "block";
            } else {
                emptyMessage.style.display = "none";
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const li = document.createElement("li");
                li.className = `task-item priority-${data.priority || 'medium'}`;

                if (data.completed) {
                    li.classList.add("completed");
                }

                // Checkbox
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "task-checkbox";
                checkbox.checked = data.completed || false;
                checkbox.onchange = () => toggleComplete(doc.id, data.completed);

                // Task content container
                const content = document.createElement("div");
                content.className = "task-content";

                // Task text
                const taskText = document.createElement("span");
                taskText.className = "task-text";
                taskText.textContent = data.text;

                // Priority label
                const priorityLabel = document.createElement("span");
                priorityLabel.className = "task-priority";
                priorityLabel.textContent = (data.priority || 'medium') + " priority";

                content.appendChild(taskText);
                content.appendChild(priorityLabel);

                // Delete button
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "delete-btn";
                deleteBtn.textContent = "Delete";
                deleteBtn.onclick = () => db.collection("tasks").doc(doc.id).delete();

                li.appendChild(checkbox);
                li.appendChild(content);
                li.appendChild(deleteBtn);
                list.appendChild(li);
            });
        }, error => {
            console.error("Error loading tasks:", error);
            if (error.code === 'failed-precondition') {
                // Index not yet created, load without ordering
                loadTasksWithoutOrder();
            }
        });
}

// Fallback: Load tasks without ordering (if index not created)
function loadTasksWithoutOrder() {
    const user = auth.currentUser;

    db.collection("tasks")
        .where("uid", "==", user.uid)
        .onSnapshot(snapshot => {
            const list = document.getElementById("taskList");
            const emptyMessage = document.getElementById("emptyMessage");
            list.innerHTML = "";

            if (snapshot.empty) {
                emptyMessage.style.display = "block";
            } else {
                emptyMessage.style.display = "none";
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const li = document.createElement("li");
                li.className = `task-item priority-${data.priority || 'medium'}`;

                if (data.completed) {
                    li.classList.add("completed");
                }

                // Checkbox
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "task-checkbox";
                checkbox.checked = data.completed || false;
                checkbox.onchange = () => toggleComplete(doc.id, data.completed);

                // Task content container
                const content = document.createElement("div");
                content.className = "task-content";

                // Task text
                const taskText = document.createElement("span");
                taskText.className = "task-text";
                taskText.textContent = data.text;

                // Priority label
                const priorityLabel = document.createElement("span");
                priorityLabel.className = "task-priority";
                priorityLabel.textContent = (data.priority || 'medium') + " priority";

                content.appendChild(taskText);
                content.appendChild(priorityLabel);

                // Delete button
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "delete-btn";
                deleteBtn.textContent = "Delete";
                deleteBtn.onclick = () => db.collection("tasks").doc(doc.id).delete();

                li.appendChild(checkbox);
                li.appendChild(content);
                li.appendChild(deleteBtn);
                list.appendChild(li);
            });
        });
}

// Check if user is already logged in
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("todo-section").style.display = "block";
        document.getElementById("logoutBtn").style.display = "block";
        loadTasks();
    }
});
