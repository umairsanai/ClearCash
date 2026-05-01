export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const API_URL = 'http://127.0.0.1:3000/api/v1';

export async function request(url, options) {
    return (await (await fetch(url, options)).json()).data;
}

export async function fetchUser() {
    return (await request(`${API_URL}/users/me`, {
        credentials: "include"
    })).user;
};

export function capitalize(word) {
    return 
    word
    .map(w => w[0].toUpperCase() + w.toLowerCase().slice(1))
    .join(" ");
} 

export function format(number) {
    return new Intl.NumberFormat('en-US', { 
        style: 'decimal' 
    }).format(number);
} 
    
export function convertInSnakeCase(name) {
    return name.replaceAll(" ", "_").toLowerCase();
} 