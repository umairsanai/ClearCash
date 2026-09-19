export type Route = "/" | "/auth";

export function navigate(path: Route) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function getCurrentRoute(): Route {
  if (window.location.pathname === "/index.html") {
    window.history.replaceState({}, "", "/");
  }

  if (window.location.pathname === "/auth.html") {
    window.history.replaceState({}, "", "/auth");
  }

  return window.location.pathname === "/auth" ? "/auth" : "/";
}
