export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function request(url, options) {
    try {
        let res = await fetch(url, options);
        const ok = res.ok;
        
        if (res.status !== 204)
            res = await res.json();

        if (!ok) {
            console.error("Error: ", res.message || "Request failed");
            throw new Error(res.message || "Request failed");
        }    

        return res.data;
    } catch (error) {
        throw error;
    }
}

export async function fetchUser() {
    try {
        let res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
            credentials: "include"
        });        
        const ok = res.ok;
        res = await res.json();
        if (!ok) {
            throw new Error(res.message || "Couldn't fetch user");
        }
        return res.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export async function fetchPockets() {
    try {
        let res = await fetch(`${import.meta.env.VITE_API_URL}/pockets/`, {
            credentials: "include"
        });        
        const ok = res.ok;
        res = await res.json();
        if (!ok) {
            throw new Error(res.message || "Couldn't fetch pockets");
        }
        return res.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export async function fetchNotifications() {
    try {
        let res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/`, {
            credentials: "include"
        });        
        const ok = res.ok;
        res = await res.json();
        if (!ok) {
            throw new Error(res.message || "Couldn't fetch notifications");
        }
        return res.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export function capitalize(word) {
    return word
    .map(w => w[0].toUpperCase() + w.toLowerCase().slice(1))
    .join(" ");
} 

export function format(number) {
    return new Intl.NumberFormat('en-US', { 
        style: 'decimal' 
    }).format(number);
} 

export function formatDate(date) {
    return new Intl.DateTimeFormat('fr-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

export function convertInSnakeCase(name) {
    return name.replaceAll(" ", "_").toLowerCase();
}

export function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export const wait = (seconds) => new Promise((res) => setTimeout(res, seconds*1000));