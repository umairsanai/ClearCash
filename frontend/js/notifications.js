const notificationsContainer = document.getElementById("notifications-panel");
const notificationsIcon = document.getElementById("notifications-btn");
const notificationsCloseButton = document.getElementById("close-notifications-btn");

function showNotifications() {
    notificationsContainer.classList.remove("hidden");
}
function hideNotifications() {
    notificationsContainer.classList.add("hidden");
}

notificationsIcon.addEventListener("click", showNotifications);
notificationsCloseButton.addEventListener("click", hideNotifications);