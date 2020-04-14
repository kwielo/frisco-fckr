let sessionStore;

module.exports = {
  setSession(session) {
    sessionStore = session;
  },
  isSignIn() {
    return !!sessionStore;
  },
  set(name, value) {
    sessionStore[name] = value;
  },
  get(name) {
    return sessionStore[name];
  },
  getSession() {
    return sessionStore;
  }
}